export default function ToolPageShell({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="px-3 py-6 text-white sm:px-4 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 md:mb-8 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-white/65 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl sm:p-5 md:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}