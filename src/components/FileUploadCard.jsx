import { UploadCloud, FileText } from "lucide-react";

export default function FileUploadCard({
  onSelect,
  selectedFile,
  buttonText = "Select PDF",
  accept = ".pdf",
  children,
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-cyan-400/40 bg-black/20 p-4 text-center sm:p-6 md:p-8">
      <UploadCloud className="mx-auto mb-4 h-10 w-10 text-cyan-400 sm:h-12 sm:w-12" />

      <h2 className="text-xl font-semibold sm:text-2xl">Drop file here</h2>
      <p className="mt-2 text-sm text-white/60 sm:text-base">
        Drag & drop or choose a file below
      </p>

      <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-black hover:opacity-90 sm:px-6">
        {buttonText}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] || null)}
        />
      </label>

      {selectedFile && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-white/55">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}