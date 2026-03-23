import { useState } from "react";
import { FileText, Layers, X } from "lucide-react";
import DropZone from "../components/DropZone";
import { API_URL } from "../config";

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
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(`${API_URL}/api/merge-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to merge PDFs.");
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

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSelectedFiles = (selectedFiles) => {
    const onlyPdf = selectedFiles.filter(
      (selectedFile) => selectedFile.type === "application/pdf"
    );

    if (onlyPdf.length === 0) {
      setMessage("Only PDF files are allowed.");
      return;
    }

    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...onlyPdf];

      const uniqueFiles = combined.filter(
        (file, index, self) =>
          index ===
          self.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          )
      );

      return uniqueFiles;
    });

    setMessage("");
  };

  return (
    <section className="px-3 py-8 text-white sm:px-4 md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Merge PDF
          </h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">
            Upload multiple PDF files and combine them into one document.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8">
          <DropZone
            title="Drop PDF files here"
            subtitle="Drag & drop multiple PDF files or click below"
            buttonText="Select PDFs"
            accept="application/pdf"
            multiple={true}
            onFilesSelected={handleSelectedFiles}
          />

          {files.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <p className="text-sm font-semibold text-white/90 sm:text-base">
                  {files.length} file(s) selected
                </p>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
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

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

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