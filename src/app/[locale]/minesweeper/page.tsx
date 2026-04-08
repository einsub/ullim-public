import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Link from "next/link";

export default async function MinesweeperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const app = dict.minesweeper;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link
        href={`/${locale}`}
        className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        &larr; {dict.common.home}
      </Link>

      <h1 className="mt-8 text-2xl font-bold">{app.name}</h1>
      <p className="mt-2 text-neutral-500 dark:hover:text-neutral-400">
        {app.description}
      </p>

      <nav className="mt-10 space-y-2 text-sm">
        <Link
          href={`/${locale}/minesweeper/privacy-policy`}
          className="block text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {dict.common.privacyPolicy}
        </Link>
        <Link
          href={`/${locale}/minesweeper/support`}
          className="block text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {dict.common.support}
        </Link>
      </nav>
    </div>
  );
}
