import { useState } from "react";
import { FileText } from "lucide-react";
import DropZone from "../components/DropZone";

export default function PdfToWordPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConvert = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Converting PDF to Word...");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://pdfnova-backend.onrender.com/api/pdf-to-word", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to convert PDF to Word.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.docx";
      a.click();

      window.URL.revokeObjectURL(url);
      setMessage("Download started successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">PDF to Word</h2>
          <p className="mt-3 text-white/65">
            Upload a PDF file and convert it into an editable Word document.
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
                  <FileText className="h-5 w-5 text-cyan-400" />
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

              <button
                onClick={handleConvert}
                disabled={loading}
                className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Converting..." : "Convert and Download"}
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