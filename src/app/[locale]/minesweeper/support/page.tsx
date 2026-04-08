import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Link from "next/link";

export default async function MinesweeperSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const sup = dict.minesweeper.support;

  return (
    <div className="flex flex-col min-h-screen px-6 pt-14">
      <article className="mx-auto w-full max-w-lg py-16">
        <Link
          href={`/${locale}/minesweeper`}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          &larr; {dict.minesweeper.name}
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-white">{sup.title}</h1>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-white/70">
          <div>
            <h2 className="font-semibold text-white/90">{sup.contactTitle}</h2>
            <p className="mt-1">
              {sup.contactDesc}<br />
              <a href="mailto:support@ull.im" className="underline text-white/60 hover:text-white/90">support@ull.im</a>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{sup.howToPlayTitle}</h2>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              {sup.howToPlay.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{sup.faqTitle}</h2>
            <div className="mt-2 space-y-3">
              {sup.faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-medium text-white/80">{item.q}</h3>
                  <p className="mt-0.5">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>

      <div className="flex-1" />

      <footer className="pb-8 text-center text-xs text-white/30">
        <p>&copy; {new Date().getFullYear()} Ullim Studio</p>
      </footer>
    </div>
  );
}
