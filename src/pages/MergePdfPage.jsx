import { useState } from "react";
import { FileText, GripVertical, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import DropZone from "../components/DropZone";

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [message, setMessage] = useState("");

  const handleSelectedFiles = (selectedFiles) => {
    const onlyPdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...onlyPdfFiles]);

    if (selectedFiles.length !== onlyPdfFiles.length) {
      setMessage("Only PDF files are allowed.");
    } else {
      setMessage("");
    }
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newFiles.length) return;

    [newFiles[index], newFiles[targetIndex]] = [
      newFiles[targetIndex],
      newFiles[index],
    ];

    setFiles(newFiles);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setMessage("");
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setMessage("Please select at least 2 PDF files.");
      return;
    }

    try {
      setIsMerging(true);
      setMessage("Merging PDFs...");

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();

      URL.revokeObjectURL(url);
      setMessage("Merged PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while merging PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Merge PDF</h2>
          <p className="mt-3 text-white/65">
            Drag, drop, reorder, and merge multiple PDF files into one.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <DropZone
            title="Drop PDF files here"
            subtitle="Drag & drop 2 or more PDF files or click below to upload"
            buttonText="Select PDFs"
            accept="application/pdf"
            multiple={true}
            onFilesSelected={handleSelectedFiles}
          />

          {files.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h4 className="text-lg font-semibold">Selected Files</h4>

                <button
                  onClick={clearAllFiles}
                  className="rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-500/10 p-2">
                        <FileText className="h-5 w-5 text-cyan-400" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white/90">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveFile(index, -1)}
                        disabled={index === 0}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() => moveFile(index, 1)}
                        disabled={index === files.length - 1}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↓
                      </button>

                      <button
                        className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10"
                        disabled
                        title="Drag handle UI"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => removeFile(index)}
                        className="rounded-xl border border-red-400/20 p-2 text-red-300 hover:bg-red-500/10"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={mergePdfs}
                  disabled={isMerging}
                  className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isMerging ? "Merging..." : "Merge and Download"}
                </button>

                <button
                  onClick={clearAllFiles}
                  className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {message && <p className="mt-6 text-sm text-cyan-300">{message}</p>}
        </div>
      </div>
    </section>
  );
}