const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile, execSync } = require("child_process");

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

function getQpdfPath() {
  const fixedPaths = ["/usr/bin/qpdf", "/bin/qpdf", "/usr/local/bin/qpdf"];

  for (const p of fixedPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  try {
    const found = execSync("which qpdf", { encoding: "utf8" }).trim();
    if (found) return found;
  } catch (_) {}

  return null;
}

// ================= BASIC ROUTES =================
app.get("/", (req, res) => {
  res.send("PDFNova backend running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "API is working",
  });
});

app.get("/api/qpdf-check", (req, res) => {
  const qpdfPath = getQpdfPath();
  res.json({
    ok: !!qpdfPath,
    path: qpdfPath || null,
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

    runPython([scriptPath, inputPath, outputPath], (error, stdout, stderr) => {
      if (error) {
        console.error("PDF TO WORD ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
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
app.post("/api/merge-pdf", upload.array("files", 20), (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).send("Please upload at least 2 PDF files.");
    }

    const qpdfPath = getQpdfPath();
    if (!qpdfPath) {
      cleanupFiles(req.files.map((file) => file.path));
      return res.status(500).send("qpdf not found on server.");
    }

    const outputPath = path.resolve(outputDir, `merged-${Date.now()}.pdf`);

    const args = ["--empty", "--pages"];

    req.files.forEach((file) => {
      const inputPath = path.resolve(file.path);
      args.push(inputPath, "1-z");
    });

    args.push("--", outputPath);

    execFile(qpdfPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error("MERGE ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        cleanupFiles([...req.files.map((file) => file.path), outputPath]);
        return res.status(500).send(stderr || "Merge failed.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([...req.files.map((file) => file.path), outputPath]);
        return res.status(500).send("Merged PDF was not created.");
      }

      res.download(outputPath, "merged.pdf", (downloadErr) => {
        if (downloadErr) {
          console.error("DOWNLOAD ERROR:", downloadErr);
        }
        cleanupFiles([...req.files.map((file) => file.path), outputPath]);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server error.");
  }
});

// ================= COMPRESS PDF =================
app.post("/api/compress-pdf", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(
      outputDir,
      `compressed-${req.file.filename}`
    );

    const qpdfPath = getQpdfPath();
    if (!qpdfPath) {
      cleanupFiles([inputPath]);
      return res.status(500).send("qpdf not found on server.");
    }

    const args = [
      "--stream-data=compress",
      "--compression-level=9",
      inputPath,
      outputPath,
    ];

    execFile(qpdfPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error("COMPRESS ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send(stderr || "Compression failed.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("Compressed file was not created.");
      }

      res.download(outputPath, "compressed.pdf", (downloadErr) => {
        if (downloadErr) {
          console.error("DOWNLOAD ERROR:", downloadErr);
        }
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server error.");
  }
});

// ================= SPLIT PDF =================
// Frontend should send:
// file = PDF file
// pageRanges = like "1-2" or "3" or "4-6"
app.post("/api/split-pdf", upload.single("file"), (req, res) => {
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
    const outputPath = path.resolve(
      outputDir,
      `split-${req.file.filename}`
    );

    const qpdfPath = getQpdfPath();
    if (!qpdfPath) {
      cleanupFiles([inputPath]);
      return res.status(500).send("qpdf not found on server.");
    }

    const args = [
      inputPath,
      "--pages",
      inputPath,
      String(pageRanges).trim(),
      "--",
      outputPath,
    ];

    execFile(qpdfPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error("SPLIT ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send(stderr || "Split failed.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("Split PDF was not created.");
      }

      res.download(outputPath, "split.pdf", (downloadErr) => {
        if (downloadErr) {
          console.error("DOWNLOAD ERROR:", downloadErr);
        }
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server error.");
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