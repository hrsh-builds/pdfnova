import { useState } from "react";
import { FileText, Layers } from "lucide-react";
import DropZone from "../components/DropZone";
import { API_URL } from "../../vite.config";

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage("Please select at least 2 PDF files.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Merging PDFs...");

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_URL}/api/merge-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Merge failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      setMessage("Merged PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Merge failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setMessage("");
  };

  return (
    <section className="px-3 py-8 sm:px-4 md:px-6 md:py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Merge PDF
          </h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">
            Combine multiple PDF files into a single document.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8">
          <DropZone
            title="Drop PDF files here"
            subtitle="Upload multiple PDF files"
            buttonText="Select PDFs"
            accept="application/pdf"
            multiple={true}
            onFilesSelected={(selectedFiles) => {
              const onlyPdf = selectedFiles.filter(
                (file) => file.type === "application/pdf"
              );

              if (onlyPdf.length > 0) {
                setFiles(onlyPdf);
                setMessage("");
              } else {
                setFiles([]);
                setMessage("Only PDF files are allowed.");
              }
            }}
          />

          {files.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <p className="text-sm text-white/80">
                  {files.length} file(s) selected
                </p>
              </div>

              {/* File list */}
              <div className="space-y-3 max-h-48 overflow-auto pr-1">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <FileText className="h-5 w-5 text-cyan-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/90">
                        {file.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={handleMerge}
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Merging..." : "Merge and Download"}
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