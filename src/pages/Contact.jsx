export default function Contact() {
  return (
    <section className="px-4 py-12 text-white md:px-6 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold md:text-4xl">Contact Us</h1>

        <p className="mb-4 text-white/70">
          If you have questions, feedback, or business inquiries, contact us using
          the details below.
        </p>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-3 text-white/80">
            <span className="font-semibold">Website:</span> PDFNova
          </p>

          <p className="mb-3 text-white/80">
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:hrrsshhhh@gmail.com"
              className="text-cyan-400 hover:underline"
            >
             hrrsshhhh@gmail.com
            </a>
          </p>

          <p className="text-white/70">
            We aim to respond as soon as possible.
          </p>
        </div>
      </div>
    </section>
  );
}