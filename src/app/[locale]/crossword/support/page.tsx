import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Link from "next/link";

export default async function CrosswordSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const sup = dict.crossword.support;

  return (
    <article className="mx-auto max-w-lg px-6 py-16">
      <Link
        href={`/${locale}/crossword`}
        className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        &larr; {dict.crossword.name}
      </Link>

      <h1 className="mt-8 text-2xl font-bold">{sup.title}</h1>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{sup.contactTitle}</h2>
          <p className="mt-1">
            {sup.contactDesc}<br />
            <a href="mailto:support@ull.im" className="underline">support@ull.im</a>
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{sup.howToPlayTitle}</h2>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {sup.howToPlay.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-200">{sup.faqTitle}</h2>
          <div className="mt-2 space-y-3">
            {sup.faq.map((item, i) => (
              <div key={i}>
                <h3 className="font-medium text-neutral-800 dark:text-neutral-300">{item.q}</h3>
                <p className="mt-0.5">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
