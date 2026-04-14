import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Image from "next/image";
import Link from "next/link";

const apps = [
  { key: "crossword" as const, href: "crossword", icon: "/icons/crossword.png" },
  { key: "minesweeper" as const, href: "minesweeper", icon: "/icons/minesweeper.png" },
  { key: "jotDaily" as const, href: "jot-daily", icon: "/icons/jot-daily.png" },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="flex flex-col items-center justify-center px-6 min-h-screen">
      <div className="flex-1" />

      <h1 className={locale === "ko"
        ? "font-[family-name:var(--font-gowun-batang)] text-7xl font-bold text-white"
        : "font-[family-name:var(--font-galada)] text-7xl text-white"
      }>
        {locale === "ko" ? "울림" : "ullim"}
      </h1>
      <p className="mt-6 text-white/70">
        {dict.landing.tagline}
      </p>

      <div className="mt-12 w-full max-w-sm space-y-3">
        {apps.map((app) => {
          const appDict = dict[app.key];
          return (
            <Link
              key={app.key}
              href={`/${locale}/${app.href}`}
              className="flex items-center gap-4 rounded-lg bg-white/10 backdrop-blur px-5 py-4 hover:bg-white/20 transition-colors"
            >
              <Image
                src={app.icon}
                alt={appDict.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <div className="font-medium text-white">{appDict.name}</div>
                <div className="text-sm text-white/60">
                  {appDict.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-sm text-white/50">
        <a href={`mailto:${dict.landing.contactEmail}`} className="hover:text-white/80 transition-colors">
          {dict.landing.contactEmail}
        </a>
      </div>

      <div className="flex-1" />

      <footer className="pb-8 text-center text-xs text-white/30">
        <p>&copy; {new Date().getFullYear()} Ullim Studio</p>
      </footer>
    </div>
  );
}
