import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl" role="img" aria-label="sun">
            ☀️
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-amber-900 dark:text-amber-100 sm:text-6xl">
            Sipra
          </h1>
        </div>

        <p className="max-w-md text-xl leading-relaxed text-amber-800/80 dark:text-amber-200/80 sm:text-2xl">
          A little something good, every day.
        </p>

        <p className="max-w-sm text-base leading-relaxed text-amber-700/70 dark:text-amber-300/70">
          One short, uplifting message delivered to your inbox each morning. Choose the topics that
          matter to you.
        </p>

        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.98]"
        >
          Get Started
        </Link>
      </main>

      <footer className="mt-16 text-sm text-amber-600/60 dark:text-amber-400/60">
        Sipra &mdash; daily positivity, delivered.
      </footer>
    </div>
  );
}
