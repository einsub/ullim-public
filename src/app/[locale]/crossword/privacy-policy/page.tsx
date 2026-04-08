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
    <article className="mx-auto max-w-lg px-6 py-16">
      <Link
        href={`/${locale}/crossword`}
        className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        &larr; {dict.crossword.name}
      </Link>

      <h1 className="mt-8 text-2xl font-bold">{pp.title}</h1>
      <p className="mt-1 text-sm text-neutral-400">{pp.lastUpdated}</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.overviewTitle}</h2>
          <p className="mt-1">{pp.overview}</p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.dataTitle}</h2>
          <p className="mt-1">{pp.data}</p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.thirdPartyTitle}</h2>
          <p className="mt-1">{pp.thirdParty}</p>
          <h3 className="mt-3 font-medium text-neutral-800 dark:text-neutral-300">{pp.admobTitle}</h3>
          <p className="mt-1">
            {pp.admob}{" "}
            <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">
              {dict.common.googlePrivacyPolicy}
            </a>
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.childrenTitle}</h2>
          <p className="mt-1">{pp.children}</p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.changesTitle}</h2>
          <p className="mt-1">{pp.changes}</p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{pp.contactTitle}</h2>
          <p className="mt-1">
            {pp.contact}{" "}
            <a href="mailto:support@ull.im" className="underline">support@ull.im</a>
          </p>
        </div>
      </section>
    </article>
  );
}
