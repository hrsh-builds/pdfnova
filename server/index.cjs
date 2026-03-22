const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- middleware ----------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- folders ----------
const uploadDir = path.resolve(__dirname, "uploads");
const outputDir = path.resolve(__dirname, "outputs");

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      throw new Error(`${dirPath} exists but is not a folder.`);
    }
  } else {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDir(uploadDir);
ensureDir(outputDir);

// ---------- upload ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ---------- helpers ----------
function cleanupFiles(files = []) {
  setTimeout(() => {
    try {
      for (const filePath of files) {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error("CLEANUP ERROR:", err);
    }
  }, 3000);
}

function runCommand(command, args, callback) {
  execFile(command, args, { windowsHide: true }, callback);
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

// ---------- basic routes ----------
app.get("/", (req, res) => {
  res.send("PDFNova backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "API is working",
  });
});

app.post("/api/test-upload", upload.single("file"), (req, res) => {
  res.json({
    ok: true,
    filename: req.file ? req.file.originalname : null,
    savedAs: req.file ? req.file.filename : null,
  });
});

/*
  PDF TO WORD
  Requires:
  - pdf2docx installed in Python
  - server/convert_pdf_to_word.py
*/
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
        return res.status(500).send(
          stderr || stdout || "Failed to convert PDF to Word."
        );
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
    res.status(500).send(err.message || "Server error");
  }
});

/*
  COMPRESS PDF
  Requires Ghostscript installed and added to PATH
*/
app.post("/api/compress-pdf", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(outputDir, `compressed-${req.file.filename}`);

    const level = req.body.level || "screen";
    const allowedLevels = ["screen", "ebook", "printer"];

    if (!allowedLevels.includes(level)) {
      return res.status(400).send("Invalid compression level.");
    }

    const gsCommand = process.platform === "win32" ? "gswin64c" : "gs";

    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=/${level}`,
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    runCommand(gsCommand, args, (error, stdout, stderr) => {
      if (error) {
        console.error("COMPRESS ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        cleanupFiles([inputPath, outputPath]);
        return res
          .status(500)
          .send("Compression failed. Make sure Ghostscript is installed.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("Compressed PDF was not created.");
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
    res.status(500).send(err.message || "Server error");
  }
});

/*
  PROTECT PDF
  Requires qpdf installed and added to PATH
*/
app.post("/api/protect-pdf", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { userPassword, ownerPassword } = req.body;

    if (!userPassword || !ownerPassword) {
      cleanupFiles([req.file.path]);
      return res
        .status(400)
        .send("User password and owner password are required.");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(outputDir, `protected-${req.file.filename}`);

    const args = [
      "--encrypt",
      userPassword,
      ownerPassword,
      "256",
      "--",
      inputPath,
      outputPath,
    ];

    runCommand("qpdf", args, (error, stdout, stderr) => {
      if (error) {
        console.error("QPDF ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        cleanupFiles([inputPath, outputPath]);
        return res
          .status(500)
          .send("Protect PDF failed. Make sure qpdf is installed.");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("Protected PDF was not created.");
      }

      res.download(outputPath, "protected.pdf", (downloadErr) => {
        if (downloadErr) {
          console.error("DOWNLOAD ERROR:", downloadErr);
        }
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (err) {
    console.error("PROTECT PDF ERROR:", err);
    res.status(500).send(err.message || "Failed to protect PDF.");
  }
});

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});