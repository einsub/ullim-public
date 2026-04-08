import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Image from "next/image";
import Link from "next/link";

const apps = [
  { key: "crossword" as const, href: "crossword", icon: "/icons/crossword.png" },
  { key: "minesweeper" as const, href: "minesweeper", icon: "/icons/minesweeper.png" },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">ullim</h1>
      <p className="mt-3 text-neutral-500 dark:text-neutral-400">
        {dict.landing.tagline}
      </p>

      <div className="mt-16 w-full max-w-sm space-y-3">
        {apps.map((app) => {
          const appDict = dict[app.key];
          return (
            <Link
              key={app.key}
              href={`/${locale}/${app.href}`}
              className="flex items-center gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <Image
                src={app.icon}
                alt={appDict.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <div className="font-medium">{appDict.name}</div>
                <div className="text-sm text-neutral-400">
                  {appDict.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 text-sm text-neutral-400">
        <a href={`mailto:${dict.landing.contactEmail}`} className="hover:underline">
          {dict.landing.contactEmail}
        </a>
      </div>
    </div>
  );
}
