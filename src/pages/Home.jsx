import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import {
  FileText,
  UploadCloud,
  FileArchive,
  Scissors,
  FileImage,
  RefreshCw,
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
} from "lucide-react";

const tools = [
  {
    title: "Compress PDF",
    desc: "Reduce PDF file size while keeping quality.",
    icon: FileArchive,
    path: "/compress-pdf",
  },
  {
    title: "Merge PDF",
    desc: "Combine multiple PDF files into one.",
    icon: FileText,
    path: "/merge-pdf",
  },
  {
    title: "Split PDF",
    desc: "Extract selected pages into new files.",
    icon: Scissors,
    path: "/split-pdf",
  },
  {
    title: "PDF to JPG",
    desc: "Convert PDF pages into high-quality images.",
    icon: FileImage,
    path: "/pdf-to-jpg",
  },
  {
    title: "PDF to Word",
    desc: "Convert PDF files into editable Word documents.",
    icon: FileText,
    path: "/pdf-to-word",
  },
  {
    title: "JPG to PDF",
    desc: "Turn images into a neat PDF document.",
    icon: RefreshCw,
    path: "/jpg-to-pdf",
  },
  {
    title: "Protect PDF",
    desc: "Add password security to your PDF files.",
    icon: Shield,
    path: "/protect-pdf",
  },
];

function ToolCard({ title, desc, icon: Icon, path }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/40"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 transition group-hover:bg-cyan-500/20">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>

      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300">
          Ready
        </span>
      </div>

      <p className="mt-2 text-sm text-white/65">{desc}</p>

      <Link
        to={path}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
      >
        Open Tool
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [quickTool, setQuickTool] = useState("/merge-pdf");

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const firstFile = files[0];
    setSelectedFile(firstFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleContinue = () => {
    if (!selectedFile) {
      navigate(quickTool);
      return;
    }
    navigate(quickTool, { state: { fileFromHome: selectedFile } });
  };

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.20),transparent_30%)]" />
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Premium PDF workspace
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Zap className="h-4 w-4" />
              Fast tools
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Lock className="h-4 w-4" />
              Secure processing
            </span>
          </motion.div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl font-bold leading-tight md:text-6xl"
            >
              All PDF tools in one{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                modern workspace
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-lg"
            >
              Merge, split, compress, convert, and protect your PDF files with
              a premium experience.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div
              className={`rounded-3xl border-2 border-dashed p-8 text-center transition md:p-12 ${
                dragActive
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-cyan-400/40 bg-black/20"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <UploadCloud className="mx-auto mb-4 h-14 w-14 text-cyan-400" />
              </motion.div>

              <h3 className="text-2xl font-semibold md:text-3xl">
                Drop PDF or image file here
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-white/60">
                Upload a file directly from the homepage, choose the tool you
                want, and continue instantly.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3 font-semibold text-black hover:opacity-90"
                >
                  Select File
                </button>

                <select
                  value={quickTool}
                  onChange={(e) => setQuickTool(e.target.value)}
                  className="min-w-[220px] rounded-full border border-white/10 bg-[#0f172a] px-5 py-3 text-white outline-none"
                >
                  <option value="/merge-pdf">Merge PDF</option>
                  <option value="/split-pdf">Split PDF</option>
                  <option value="/compress-pdf">Compress PDF</option>
                  <option value="/jpg-to-pdf">JPG to PDF</option>
                  <option value="/pdf-to-word">PDF to Word</option>
                  <option value="/pdf-to-jpg">PDF to JPG</option>
                  <option value="/protect-pdf">Protect PDF</option>
                </select>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-full border border-white/10 px-7 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Continue
                </button>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {selectedFile && (
                <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-2">
                      <FileText className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/90">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Popular PDF Tools</h2>
            <p className="mt-3 text-white/65">
              Clean, fast, and powerful tools for everyday PDF work.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>

          <div className="mt-10">
          
          </div>
        </div>
      </section>
    </>
  );
}