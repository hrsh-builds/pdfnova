const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile, execSync } = require("child_process");
const { PDFDocument } = require("pdf-lib");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// 📁 folders
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "outputs");

// create folders if not exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(uploadDir);
ensureDir(outputDir);

// 📦 multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🧹 cleanup
function cleanupFiles(files = []) {
  setTimeout(() => {
    files.forEach((file) => {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }, 5000);
}

// 🔍 find qpdf
function getQpdfPath() {
  try {
    const result = execSync("which qpdf", { encoding: "utf8" }).trim();
    console.log("QPDF FOUND AT:", result);
    return result;
  } catch (err) {
    console.error("QPDF DETECTION FAILED");
    return null;
  }
}

// ================= ROUTES =================

// health check
app.get("/", (req, res) => {
  res.send("PDFNova backend running 🚀");
});

// check qpdf
app.get("/api/qpdf-check", (req, res) => {
  const qpdfPath = getQpdfPath();
  res.json({
    ok: !!qpdfPath,
    path: qpdfPath || null,
  });
});

// ========pdf to word==============
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
    console.log("SCRIPT PATH:", scriptPath);

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
    return res.status(500).send(err.message || "Server error");
  }
});

// ================= PROTECT PDF =================
app.post("/api/protect-pdf", upload.single("file"), (req, res) => {
  return res
    .status(503)
    .send("Protect PDF is coming soon.");
});
// ==============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});