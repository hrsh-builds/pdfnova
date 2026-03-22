import { useState } from "react";
import { FileText } from "lucide-react";
import DropZone from "../components/DropZone";
import { API_URL } from "../config";

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
      setMessage("Protecting PDF... please wait.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userPassword", userPassword);
      formData.append("ownerPassword", ownerPassword);

      const res = await fetch(`${API_URL}/api/protect-pdf`, {
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
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      setMessage("Protected PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong while protecting the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUserPassword("");
    setOwnerPassword("");
    setMessage("");
  };

  return (
    <section className="px-3 py-8 text-white sm:px-4 md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Protect PDF
          </h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">
            Upload a PDF file and add password protection.
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

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    User Password
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter user password"
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
                    placeholder="Enter owner password"
                    className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={handleProtect}
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Protecting..." : "Protect and Download"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full rounded-full border border-white/10 px-5 py-3 font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Reset
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-white/45">
                First request may take a few seconds if the server is waking up.
              </p>
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