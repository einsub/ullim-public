import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Link from "next/link";

export default async function CrosswordPrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const pp = dict.crossword.privacyPolicy;

  return (
    <div className="flex flex-col min-h-screen px-6 pt-14">
      <article className="mx-auto w-full max-w-lg py-16">
        <Link
          href={`/${locale}/crossword`}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          &larr; {dict.crossword.name}
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-white">{pp.title}</h1>
        <p className="mt-1 text-sm text-white/40">{pp.lastUpdated}</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-white/70">
          <div>
            <h2 className="font-semibold text-white/90">{pp.overviewTitle}</h2>
            <p className="mt-1">{pp.overview}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{pp.dataTitle}</h2>
            <p className="mt-1">{pp.data}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{pp.thirdPartyTitle}</h2>
            <p className="mt-1">{pp.thirdParty}</p>
            <h3 className="mt-3 font-medium text-white/80">{pp.admobTitle}</h3>
            <p className="mt-1">
              {pp.admob}{" "}
              <a href="https://policies.google.com/privacy" className="underline text-white/60 hover:text-white/90" target="_blank" rel="noopener noreferrer">
                {dict.common.googlePrivacyPolicy}
              </a>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{pp.childrenTitle}</h2>
            <p className="mt-1">{pp.children}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{pp.changesTitle}</h2>
            <p className="mt-1">{pp.changes}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">{pp.contactTitle}</h2>
            <p className="mt-1">
              {pp.contact}{" "}
              <a href="mailto:support@ull.im" className="underline text-white/60 hover:text-white/90">support@ull.im</a>
            </p>
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
