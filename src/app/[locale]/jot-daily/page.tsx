import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n";
import Image from "next/image";
import Link from "next/link";

export default async function JotDailyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const app = dict.jotDaily;

  return (
    <div className="flex flex-col min-h-screen px-6 pt-14">
      <div className="mx-auto w-full max-w-lg py-16">
        <Link
          href={`/${locale}`}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          &larr; {dict.common.home}
        </Link>

        <div className="mt-8 flex items-center gap-4">
          <Image
            src="/icons/jot-daily.png"
            alt={app.name}
            width={64}
            height={64}
            className="rounded-2xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{app.name}</h1>
            <p className="text-sm text-white/60">
              {app.subtitle}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-white/70">
          {app.intro}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { src: `/screenshots/jot-daily/onboarding-${locale}.png`, alt: "Onboarding" },
            { src: `/screenshots/jot-daily/timeline-${locale}.png`, alt: "Timeline" },
          ].map((shot) => (
            <Image
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              width={390}
              height={844}
              className="w-full h-auto rounded-xl border border-white/10"
            />
          ))}
        </div>

        <ul className="mt-8 space-y-2 text-sm text-white/70">
          {app.features.map((feature, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-white/30">—</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1" />

      <footer className="pb-8 text-center text-xs">
        <div className="flex justify-center gap-4 text-sm text-white/50">
          <Link href={`/${locale}/jot-daily/privacy-policy`} className="hover:text-white/80 transition-colors">
            {dict.common.privacyPolicy}
          </Link>
          <Link href={`/${locale}/jot-daily/support`} className="hover:text-white/80 transition-colors">
            {dict.common.support}
          </Link>
        </div>
        <p className="mt-4 text-white/30">&copy; {new Date().getFullYear()} Ullim Studio</p>
      </footer>
    </div>
  );
}
