import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Image from "next/image";
import Link from "next/link";

export default async function CrosswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const app = dict.crossword;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link
        href={`/${locale}`}
        className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        &larr; {dict.common.home}
      </Link>

      <div className="mt-8 flex items-center gap-4">
        <Image
          src="/icons/crossword.png"
          alt={app.name}
          width={64}
          height={64}
          className="rounded-2xl"
        />
        <div>
          <h1 className="text-2xl font-bold">{app.name}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {app.subtitle}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {app.intro}
      </p>

      <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
        {[
          { src: "/screenshots/crossword/2_appstore.jpg", alt: "Puzzle" },
          { src: "/screenshots/crossword/4_appstore.jpg", alt: "Complete" },
          { src: "/screenshots/crossword/5_appstore.jpg", alt: "Stages" },
        ].map((shot) => (
          <Image
            key={shot.src}
            src={shot.src}
            alt={shot.alt}
            width={180}
            height={390}
            className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800"
          />
        ))}
      </div>

      <ul className="mt-8 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        {app.features.map((feature, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-neutral-300 dark:text-neutral-600">—</span>
            {feature}
          </li>
        ))}
      </ul>

      <nav className="mt-10 flex gap-4 text-sm">
        <Link
          href={`/${locale}/crossword/privacy-policy`}
          className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {dict.common.privacyPolicy}
        </Link>
        <Link
          href={`/${locale}/crossword/support`}
          className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {dict.common.support}
        </Link>
      </nav>
    </div>
  );
}
