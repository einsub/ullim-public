import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import { locales, type Locale } from "@/i18n";
import { getDictionary } from "@/dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: {
      default: dict.meta.title,
      template: `%s — ${dict.meta.title}`,
    },
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <header className="flex justify-end px-6 py-4">
          <Link
            href={`/${otherLocale}`}
            className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="px-6 py-8 text-center text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Ullim Studio</p>
        </footer>
      </body>
    </html>
  );
}
