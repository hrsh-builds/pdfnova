import { ShieldAlert } from "lucide-react";

export default function ProtectPdfPage() {
  return (
    <section className="px-3 py-8 text-white sm:px-4 md:px-6 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <ShieldAlert className="h-8 w-8 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Protect PDF
          </h1>

          <p className="mt-4 text-sm text-white/70 sm:text-base">
            This feature is temporarily unavailable while we upgrade PDF
            encryption for production use.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">
            Please use Merge, Split, Compress, and Word tools for now.
          </div>
        </div>
      </div>
    </section>
  );
}