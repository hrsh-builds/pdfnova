import { useState } from "react";
import { FileImage, Download } from "lucide-react";
import DropZone from "../components/DropZone";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfToJpgPage() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);

  const convertPdfToJpg = async () => {
    if (files.length === 0) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setIsConverting(true);
      setMessage("Converting PDF pages to JPG...");
      setImages([]);

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const generatedImages = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.95);

        generatedImages.push({
          name: `page-${pageNum}.jpg`,
          url: jpgDataUrl,
          page: pageNum,
        });
      }

      setImages(generatedImages);
      setMessage("Conversion complete. Download your JPG files below.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while converting the PDF.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = (image) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.name;
    link.click();
  };

  const downloadAllImages = () => {
    images.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image);
      }, index * 300);
    });
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">PDF to JPG</h2>
          <p className="mt-3 text-white/65">
            Upload one PDF and convert each page into a JPG image.
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
              setImages([]);

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
                  <FileImage className="h-5 w-5 text-cyan-400" />
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

              <button
                onClick={convertPdfToJpg}
                disabled={isConverting}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting ? "Converting..." : "Convert to JPG"}
              </button>
            </div>
          )}

          {message && <p className="mt-6 text-sm text-cyan-300">{message}</p>}

          {images.length > 0 && (
            <div className="mt-10">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold">Converted Pages</h3>

                <button
                  onClick={downloadAllImages}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={image.page}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-black/20"
                  >
                    <img
                      src={image.url}
                      alt={`Page ${image.page}`}
                      className="h-64 w-full object-cover"
                    />

                    <div className="p-4">
                      <p className="text-sm font-medium text-white/90">
                        Page {image.page}
                      </p>

                      <button
                        onClick={() => downloadImage(image)}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
                      >
                        <Download className="h-4 w-4" />
                        Download JPG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}