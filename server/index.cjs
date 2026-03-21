const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

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

app.get("/", (req, res) => {
  res.send("Backend is running");
});

/*
  PDF TO WORD
  Requires:
  - py -m pip install pdf2docx
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

    execFile(
      "py",
      [scriptPath, inputPath, outputPath],
      { windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          console.error("PDF TO WORD ERROR:", error);
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          return res.status(500).send(stderr || stdout || error.message);
        }

        if (!fs.existsSync(outputPath)) {
          return res.status(500).send("DOCX file was not created.");
        }

        res.download(outputPath, "converted.docx", (downloadErr) => {
          if (downloadErr) {
            console.error("DOWNLOAD ERROR:", downloadErr);
          }
          cleanupFiles([inputPath, outputPath]);
        });
      }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).send(err.message || "Server error");
  }
});

/*
  COMPRESS PDF
  Requires Ghostscript installed and added to PATH
  Windows command: gswin64c
*/
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

    execFile(gsCommand, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        console.error("COMPRESS ERROR:", error);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        return res
          .status(500)
          .send("Compression failed. Install Ghostscript and add it to PATH.");
      }

      if (!fs.existsSync(outputPath)) {
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
  Current route connection is ready.
  Real encryption logic is NOT added in this version.
*/
app.post("/api/protect-pdf", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { userPassword, ownerPassword } = req.body;

    if (!userPassword || !ownerPassword) {
      return res
        .status(400)
        .send("User password and owner password are required.");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(
      outputDir,
      `protected-${req.file.filename}`
    );

    const qpdfCommand = process.platform === "win32" ? "qpdf" : "qpdf";

    const args = [
      "--encrypt",
      userPassword,
      ownerPassword,
      "256",
      "--",
      inputPath,
      outputPath,
    ];

    console.log("PROTECT INPUT:", inputPath);
    console.log("PROTECT OUTPUT:", outputPath);

    execFile(qpdfCommand, args, { windowsHide: true }, (error, stdout, stderr) => {
      console.log("QPDF STDOUT:", stdout);
      console.log("QPDF STDERR:", stderr);

      if (error) {
        console.error("QPDF ERROR:", error);
        return res
          .status(500)
          .send(
            "Protect PDF failed. Make sure qpdf is installed and added to PATH."
          );
      }

      if (!fs.existsSync(outputPath)) {
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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});