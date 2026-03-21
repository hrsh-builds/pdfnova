import { useState } from "react";
import { UploadCloud, FileImage } from "lucide-react";
import jsPDF from "jspdf";

export default function JpgToPdfPage() {
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validImages = selectedFiles.filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );

    setImages(validImages);

    if (selectedFiles.length !== validImages.length) {
      setMessage("Only JPG, JPEG, and PNG files are allowed.");
    } else {
      setMessage("");
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const convertToPdf = async () => {
    if (images.length === 0) {
      setMessage("Please select at least 1 image.");
      return;
    }

    try {
      setIsConverting(true);
      setMessage("Converting images to PDF...");

      const pdf = new jsPDF();

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const imageData = await readFileAsDataUrl(file);

        const img = new Image();
        img.src = imageData;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = img.width;
        const imgHeight = img.height;

        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        if (i > 0) pdf.addPage();

        const format = file.type === "image/png" ? "PNG" : "JPEG";
        pdf.addImage(imageData, format, x, y, finalWidth, finalHeight);
      }

      pdf.save("images-to-pdf.pdf");
      setMessage("PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while creating the PDF.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">JPG to PDF</h2>
          <p className="mt-3 text-white/65">
            Upload JPG or PNG images and convert them into one PDF file.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl border-2 border-dashed border-cyan-400/40 bg-black/20 p-8 text-center">
            <UploadCloud className="mx-auto mb-4 h-12 w-12 text-cyan-400" />
            <h3 className="text-2xl font-semibold">Choose image files</h3>
            <p className="mt-2 text-white/60">Select JPG, JPEG, or PNG files</p>

            <label className="mt-6 inline-block cursor-pointer rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400">
              Select Images
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-8">
              <h4 className="mb-4 text-lg font-semibold">Selected Images</h4>
              <div className="space-y-3">
                {images.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileImage className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm text-white/85">{file.name}</span>
                    </div>
                    <span className="text-xs text-white/50">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={convertToPdf}
                disabled={isConverting}
                className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting ? "Converting..." : "Convert and Download"}
              </button>
            </div>
          )}

          {message && <p className="mt-6 text-sm text-cyan-300">{message}</p>}
        </div>
      </div>
    </section>
  );
}