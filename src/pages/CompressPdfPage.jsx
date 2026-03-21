import { useState } from "react";
import { FileArchive } from "lucide-react";
import DropZone from "../components/DropZone";

export default function CompressPdfPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("screen");

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

      const res = await fetch("http://localhost:5000/api/compress-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to compress PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
      setMessage("Compressed PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Compression failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Compress PDF</h2>
          <p className="mt-3 text-white/65">
            Upload a PDF and reduce file size with different compression levels.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
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
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2">
                  <FileArchive className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/90">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Compression Level
                </label>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="screen">High Compression</option>
                  <option value="ebook">Balanced</option>
                  <option value="printer">Low Compression</option>
                </select>

                <p className="mt-2 text-xs text-white/45">
                  High compression = smaller file, lower quality. Low compression = better quality, bigger file.
                </p>
              </div>

              <button
                onClick={handleCompress}
                disabled={loading}
                className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Compressing..." : "Compress and Download"}
              </button>
            </div>
          )}

          {message && (
            <p className="mt-6 text-sm text-cyan-300">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}