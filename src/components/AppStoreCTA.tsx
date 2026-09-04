import Image from "next/image";
import { SITE_URL, getAppHref, type AppMeta } from "@/lib/apps";
import type { Locale } from "@/i18n";
import { getQrSvg } from "@/lib/qr";
import { CAMPAIGNS, storeUrl } from "@/lib/storeLinks";

type Props = {
  app: AppMeta;
  locale: Locale;
};

export async function AppStoreCTA({ app, locale }: Props) {
  if (!app.released || !app.appStoreUrl) return null;

  // 스토어가 둘이면 QR 이 App Store 만 가리키면 안 된다 — 안드로이드 사용자가
  // 찍었을 때 엉뚱한 곳으로 간다. 랜딩 페이지로 보내 각자 고르게 한다.
  // 스토어가 하나뿐인 앱은 한 단계 줄여 바로 그 스토어로 보낸다.
  const qrTarget = app.playStoreUrl
    ? `${SITE_URL}${getAppHref(app, locale)}`
    : app.appStoreUrl;
  const qrSvg = await getQrSvg(qrTarget);

  // 랜딩 페이지를 거쳐 들어온 설치를 스토어 자연 유입과 구분한다.
  // 이걸 안 붙이면 카카오 유입만 라벨이 붙고 나머지가 전부 (direct) 로 뭉쳐서,
  // 정작 비교 기준이 되어야 할 "그 외" 가 무의미해진다.
  //
  // 여기서는 /get 을 거치지 않는다. 그 경로는 crossword 전용이고, 이 컴포넌트는
  // 모든 앱이 공유한다. 클릭 수는 랜딩 페이지 자체의 웹 분석으로 이미 보인다.
  const iosHref = storeUrl(app, "ios", CAMPAIGNS.web) ?? app.appStoreUrl;
  const androidHref = storeUrl(app, "android", CAMPAIGNS.web);
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
          href={iosHref}
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
        {androidHref && (
          <a
            href={androidHref}
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
