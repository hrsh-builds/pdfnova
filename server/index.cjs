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
  const paths = ["/usr/bin/qpdf", "/bin/qpdf", "/usr/local/bin/qpdf"];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const found = execSync("which qpdf", { encoding: "utf8" }).trim();
    if (found) return found;
  } catch (e) {}

  return null;
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
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const { userPassword, ownerPassword } = req.body;

    if (!userPassword || !ownerPassword) {
      cleanupFiles([req.file.path]);
      return res.status(400).send("Passwords required");
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(
      outputDir,
      "protected-" + req.file.filename
    );

    const qpdf = getQpdfPath();

    if (!qpdf) {
      cleanupFiles([inputPath]);
      return res.status(500).send("qpdf not installed on server");
    }

    const args = [
      "--encrypt",
      userPassword,
      ownerPassword,
      "256",
      "--",
      inputPath,
      outputPath,
    ];

    console.log("QPDF PATH:", qpdf);

    execFile(qpdf, args, (error, stdout, stderr) => {
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);

      if (error) {
        console.error("QPDF ERROR:", error);
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send(stderr || "Protect failed");
      }

      if (!fs.existsSync(outputPath)) {
        cleanupFiles([inputPath, outputPath]);
        return res.status(500).send("Output not created");
      }

      res.download(outputPath, "protected.pdf", (err) => {
        if (err) console.error("Download error:", err);
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).send("Server error");
  }
});

// ==============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});