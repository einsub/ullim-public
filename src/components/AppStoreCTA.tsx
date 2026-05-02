import Image from "next/image";
import type { AppMeta } from "@/lib/apps";
import type { Locale } from "@/i18n";
import { getQrSvg } from "@/lib/qr";

type Props = {
  app: AppMeta;
  locale: Locale;
};

export async function AppStoreCTA({ app, locale }: Props) {
  if (!app.released || !app.appStoreUrl) return null;

  const qrSvg = await getQrSvg(app.appStoreUrl);
  const appStoreBadge = locale === "ko"
    ? "/badges/app-store-ko.svg"
    : "/badges/app-store-en.svg";
  const playStoreBadge = locale === "ko"
    ? "/badges/play-store-ko.png"
    : "/badges/play-store-en.png";

  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white/5 p-4 sm:p-5">
      <div
        className="hidden sm:block shrink-0 rounded-lg bg-white p-2 [&>svg]:block"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <div className="flex flex-col gap-2">
        <a
          href={app.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-opacity hover:opacity-80"
        >
          <Image
            src={appStoreBadge}
            alt="Download on the App Store"
            width={140}
            height={47}
            className="h-12 w-auto"
            unoptimized
          />
        </a>
        {app.playStoreUrl && (
          <a
            href={app.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <Image
              src={playStoreBadge}
              alt="Get it on Google Play"
              width={155}
              height={60}
              className="h-12 w-auto"
              unoptimized
            />
          </a>
        )}
      </div>
    </div>
  );
}
