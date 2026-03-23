const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const { PDFDocument } = require("pdf-lib");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ================= FOLDERS =================
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "outputs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(uploadDir);
ensureDir(outputDir);

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ================= HELPERS =================
function cleanupFiles(files = []) {
  setTimeout(() => {
    for (const file of files) {
      try {
        if (file && fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error("CLEANUP ERROR:", err);
      }
    }
  }, 5000);
}

function runPython(args, callback) {
  const commands =
    process.platform === "win32"
      ? ["py", "python"]
      : ["python3", "python"];

  let index = 0;

  function tryNext(lastError = null) {
    if (index >= commands.length) {
      return callback(lastError || new Error("Python not found"), "", "");
    }

    const cmd = commands[index++];
    execFile(cmd, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return tryNext(error);
      }
      callback(null, stdout, stderr);
    });
  }

  tryNext();
}

// ================= BASIC ROUTES =================
app.get("/", (req, res) => {
  res.send("PDFNova backend running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "API is working",
  });
});

// ================= PDF TO WORD =================
app.post("/api/pdf-to-word", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(
      outputDir,
      `${path.parse(req.file.filename).name}.docx`
    );
    const scriptPath = path.resolve(__dirname, "convert_pdf_to_word.py");

    console.log("PDF TO WORD INPUT:", inputPath);
    console.log("PDF TO WORD OUTPUT:", outputPath);

    runPython([scriptPath, inputPath, outputPath], (error, stdout, stderr) => {
      console.log("PYTHON STDOUT:", stdout);
      console.log("PYTHON STDERR:", stderr);

      if (error) {
        console.error("PDF TO WORD ERROR:", error);
        cleanupFiles([inputPath, outputPath]);
        return res
          .status(500)
          .send(stderr || stdout || error.message || "Failed to convert PDF to Word.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("DOCX file was not created.");
      }

      res.download(outputPath, "converted.docx", (downloadErr) => {
        if (downloadErr) {
          console.error("DOWNLOAD ERROR:", downloadErr);
        }
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send(err.message || "Server error.");
  }
});

// ================= MERGE PDF =================
// Frontend must send multiple files using key: files
app.post("/api/merge-pdf", upload.array("files", 20), async (req, res) => {
  const uploadedPaths = req.files ? req.files.map((file) => file.path) : [];

  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).send("Please upload at least 2 PDF files.");
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const pageIndices = pdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const outputPath = path.resolve(outputDir, `merged-${Date.now()}.pdf`);

    fs.writeFileSync(outputPath, mergedBytes);

    res.download(outputPath, "merged.pdf", (downloadErr) => {
      if (downloadErr) {
        console.error("DOWNLOAD ERROR:", downloadErr);
      }
      cleanupFiles([...uploadedPaths, outputPath]);
    });
  } catch (err) {
    console.error("MERGE ERROR:", err);
    cleanupFiles(uploadedPaths);
    return res.status(500).send(err.message || "Failed to merge PDFs.");
  }
});

// ================= SPLIT PDF =================
// Frontend must send:
// file = one PDF
// pageRanges = like "1-2" or "3" or "4-6"
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { pageRanges } = req.body;

    if (!pageRanges || !String(pageRanges).trim()) {
      cleanupFiles([req.file.path]);
      return res.status(400).send("Page range is required. Example: 1-2");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(outputDir, `split-${req.file.filename}`);

    const pdfBytes = fs.readFileSync(inputPath);
    const sourcePdf = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();

    const totalPages = sourcePdf.getPageCount();
    const ranges = String(pageRanges)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const selectedPages = [];

    for (const range of ranges) {
      if (range.includes("-")) {
        const [startRaw, endRaw] = range.split("-");
        const start = parseInt(startRaw, 10);
        const end = parseInt(endRaw, 10);

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          start < 1 ||
          end < start ||
          end > totalPages
        ) {
          cleanupFiles([inputPath]);
          return res.status(400).send(`Invalid page range: ${range}`);
        }

        for (let i = start; i <= end; i++) {
          selectedPages.push(i - 1);
        }
      } else {
        const page = parseInt(range, 10);

        if (Number.isNaN(page) || page < 1 || page > totalPages) {
          cleanupFiles([inputPath]);
          return res.status(400).send(`Invalid page number: ${range}`);
        }

        selectedPages.push(page - 1);
      }
    }

    if (selectedPages.length === 0) {
      cleanupFiles([inputPath]);
      return res.status(400).send("No valid pages selected.");
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, selectedPages);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const splitBytes = await newPdf.save();
    fs.writeFileSync(outputPath, splitBytes);

    res.download(outputPath, "split.pdf", (downloadErr) => {
      if (downloadErr) {
        console.error("DOWNLOAD ERROR:", downloadErr);
      }
      cleanupFiles([inputPath, outputPath]);
    });
  } catch (err) {
    console.error("SPLIT ERROR:", err);
    cleanupFiles([req.file?.path]);
    return res.status(500).send(err.message || "Failed to split PDF.");
  }
});

// ================= PROTECT PDF =================
app.post("/api/protect-pdf", upload.single("file"), (req, res) => {
  return res.status(503).send("Protect PDF is coming soon.");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});