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

// ================= PROTECT PDF =================
app.post("/api/protect-pdf", upload.single("file"), (req, res) => {
  return res
    .status(503)
    .send("Protect PDF is temporarily unavailable while encryption is being upgraded.");
});
// ==============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});