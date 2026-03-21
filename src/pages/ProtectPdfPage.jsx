import { useState } from "react";
import DropZone from "../components/DropZone";
import { FileText, Lock } from "lucide-react";

export default function ProtectPdfPage() {
  const [file, setFile] = useState(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleProtect = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (!userPassword.trim() || !ownerPassword.trim()) {
      setMessage("User password and owner password are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Protecting PDF...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userPassword", userPassword);
      formData.append("ownerPassword", ownerPassword);

      const res = await fetch("http://localhost:5000/api/protect-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to protect PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "protected.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
      setMessage("Protected PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong while protecting the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-12 md:px-6 md:py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold md:text-4xl">Protect PDF</h2>
          <p className="mt-3 text-sm text-white/65 md:text-base">
            Upload a PDF and add password protection.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:p-8">
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
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 md:mt-8 md:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    User Password
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Required to open PDF"
                    className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Owner Password
                  </label>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Required for permissions"
                    className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleProtect}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Protecting..." : "Protect and Download"}
                </button>
              </div>
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