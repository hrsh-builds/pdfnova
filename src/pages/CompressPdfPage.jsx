import { useState } from "react";
import { FileArchive, FileText } from "lucide-react";
import DropZone from "../components/DropZone";
import { API_URL } from "../config";

export default function CompressPdfPage() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("screen");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCompress = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Compressing PDF...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);

      const res = await fetch(`${API_URL}/api/compress-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Compression failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      setMessage("Compressed PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Compression failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setLevel("screen");
    setMessage("");
  };

  return (
    <section className="px-3 py-8 sm:px-4 md:px-6 md:py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Compress PDF
          </h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">
            Reduce PDF file size while maintaining quality.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8">
          <DropZone
            title="Drop PDF file here"
            subtitle="Drag & drop one PDF file or click below"
            buttonText="Select PDF"
            accept="application/pdf"
            multiple={false}
            onFilesSelected={(selectedFiles) => {
              const onlyPdf = selectedFiles.filter(
                (selectedFile) => selectedFile.type === "application/pdf"
              );

              if (onlyPdf.length > 0) {
                setFile(onlyPdf[0]);
                setMessage("");
              } else {
                setFile(null);
                setMessage("Only PDF files are allowed.");
              }
            }}
          />

          {file && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90 sm:text-base">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Compression level */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Compression Level
                </label>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="screen">Low (Smaller file)</option>
                  <option value="ebook">Medium (Balanced)</option>
                  <option value="printer">High (Better quality)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={handleCompress}
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Compressing..." : "Compress and Download"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full rounded-full border border-white/10 px-5 py-3 font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {message && (
            <p className="mt-6 text-center text-sm text-cyan-300">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}