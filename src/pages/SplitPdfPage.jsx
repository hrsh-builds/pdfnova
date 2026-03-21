import { useState } from "react";
import { FileText, Scissors } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import DropZone from "../components/DropZone";

export default function SplitPdfPage() {
  const [files, setFiles] = useState([]);
  const [pageRanges, setPageRanges] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [message, setMessage] = useState("");

  const parsePageRanges = (input, totalPages) => {
    const pages = new Set();

    const parts = input.split(",").map((part) => part.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((v) => v.trim());
        const start = Number(startStr);
        const end = Number(endStr);

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          start < 1 ||
          end > totalPages ||
          start > end
        ) {
          throw new Error("Invalid page range.");
        }

        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      } else {
        const page = Number(part);

        if (Number.isNaN(page) || page < 1 || page > totalPages) {
          throw new Error("Invalid page number.");
        }

        pages.add(page - 1);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (files.length === 0) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (!pageRanges.trim()) {
      setMessage("Please enter page numbers or ranges.");
      return;
    }

    try {
      setIsSplitting(true);
      setMessage("Processing PDF...");

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = originalPdf.getPageCount();

      const selectedPages = parsePageRanges(pageRanges, totalPages);

      if (selectedPages.length === 0) {
        setMessage("No valid pages selected.");
        setIsSplitting(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(originalPdf, selectedPages);

      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "split-pages.pdf";
      link.click();

      URL.revokeObjectURL(url);
      setMessage("Split PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage(
        "Invalid input. Use format like 1,3,5-7 and make sure pages exist."
      );
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Split PDF</h2>
          <p className="mt-3 text-white/65">
            Upload one PDF and extract selected pages into a new file.
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
                (file) => file.type === "application/pdf"
              );

              setFiles(onlyPdf);

              if (selectedFiles.length !== onlyPdf.length) {
                setMessage("Only PDF files are allowed.");
              } else {
                setMessage("");
              }
            }}
          />

          {files.length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/90">
                    {files[0].name}
                  </p>
                  <p className="text-xs text-white/50">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Enter page numbers or ranges
                </label>

                <input
                  type="text"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  placeholder="Example: 1,3,5-7"
                  className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-white/45">
                  Use commas for separate pages and hyphens for ranges.
                </p>
              </div>

              <button
                onClick={splitPdf}
                disabled={isSplitting}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Scissors className="h-4 w-4" />
                {isSplitting ? "Splitting..." : "Split and Download"}
              </button>
            </div>
          )}

          {message && <p className="mt-6 text-sm text-cyan-300">{message}</p>}
        </div>
      </div>
    </section>
  );
}