import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import { appList, getAppHref } from "@/lib/apps";
import Image from "next/image";
import Link from "next/link";

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
        {appList.map((meta) => {
          const appDict = dict[meta.key];
          return (
            <div
              key={meta.key}
              className="flex items-center rounded-lg bg-white/10 backdrop-blur hover:bg-white/15 transition-colors"
            >
              <Link
                href={getAppHref(meta, locale as Locale)}
                className="flex flex-1 items-center gap-4 px-5 py-4 min-w-0"
              >
                <Image
                  src={meta.icon}
                  alt={appDict.name}
                  width={40}
                  height={40}
                  className="rounded-lg shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{appDict.name}</div>
                  <div className="text-sm text-white/60 truncate">
                    {appDict.description}
                  </div>
                </div>
              </Link>
              {meta.released && meta.appStoreUrl && (
                <a
                  href={meta.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="App Store"
                  className="shrink-0 px-4 py-4 text-white/40 hover:text-white transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </a>
              )}
            </div>
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
