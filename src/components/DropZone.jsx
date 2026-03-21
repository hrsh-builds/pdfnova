import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function DropZone({
  title = "Drop files here",
  subtitle = "Drag & drop files or click below to upload",
  buttonText = "Choose Files",
  accept = "*",
  multiple = false,
  onFilesSelected,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length && onFilesSelected) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition md:p-8 ${
        dragActive
          ? "border-cyan-400 bg-cyan-400/10"
          : "border-cyan-400/40 bg-black/20"
      }`}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
    >
      <motion.div
        animate={dragActive ? { scale: [1, 1.08, 1] } : { y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <UploadCloud className="mx-auto mb-4 h-10 w-10 text-cyan-400 md:h-12 md:w-12" />
      </motion.div>

      <h3 className="text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-white/60 md:text-base">{subtitle}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 rounded-full bg-cyan-500 px-5 py-3 font-semibold text-black hover:bg-cyan-400"
      >
        {buttonText}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}