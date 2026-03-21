import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MergePdfPage from "./pages/MergePdfPage";
import JpgToPdfPage from "./pages/JpgToPdfPage";
import CompressPdfPage from "./pages/CompressPdfPage";
import SplitPdfPage from "./pages/SplitPdfPage";
import PdfToJpgPage from "./pages/PdfToJpgPage";
import PdfToWordPage from "./pages/PdfToWordPage";
import ProtectPdfPage from "./pages/ProtectPdfPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="merge-pdf" element={<MergePdfPage />} />
          <Route path="jpg-to-pdf" element={<JpgToPdfPage />} />
          <Route path="compress-pdf" element={<CompressPdfPage />} />
          <Route path="split-pdf" element={<SplitPdfPage />} />
          <Route path="pdf-to-jpg" element={<PdfToJpgPage />} />
          <Route path="pdf-to-word" element={<PdfToWordPage />} />
          <Route path="protect-pdf" element={<ProtectPdfPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}