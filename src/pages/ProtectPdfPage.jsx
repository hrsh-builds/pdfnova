import { ShieldAlert, Lock } from "lucide-react";

export default function ProtectPdfPage() {
  return (
    <section className="px-3 py-8 text-white sm:px-4 md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Protect PDF
          </h1>
          <p className="mt-3 text-sm text-white/65 sm:text-base">
            Password protection is being upgraded for production use.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
              <ShieldAlert className="h-8 w-8 text-cyan-400" />
            </div>

            <h2 className="text-xl font-semibold sm:text-2xl">
              Coming Soon
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              We are upgrading PDF encryption to deliver a stronger and more
              reliable password-protection experience.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                <div className="mb-3 inline-flex rounded-xl bg-cyan-500/10 p-2">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Stronger protection
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  We are improving encryption support before enabling this tool
                  for everyone.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                <div className="mb-3 inline-flex rounded-xl bg-cyan-500/10 p-2">
                  <ShieldAlert className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Safer experience
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  Until this is ready, please use Merge, Split, Compress, and
                  Word tools.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-200">
              Protect PDF is temporarily unavailable.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}