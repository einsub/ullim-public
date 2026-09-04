import type { Locale } from "@/i18n";

/** QR 코드처럼 절대 URL 이 필요한 곳에서 쓴다. */
export const SITE_URL = "https://ull.im";

export type AppKey = "crossword" | "minesweeper" | "jotDaily";

export type AppMeta = {
  key: AppKey;
  slug: string;
  icon: string;
  released: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
  /**
   * App Store Connect Provider Token (`pt`). App Store 캠페인 링크에 필요하다.
   * ASC → App Analytics → Acquisition → Campaigns 에서 캠페인 링크를 만들면
   * 그 URL 안에 들어있다. 공개 URL 에 그대로 노출되는 값이라 비밀이 아니다.
   *
   * 없으면 iOS 링크에 캠페인 파라미터를 붙이지 않는다 (pt 없는 ct 는 무효).
   */
  ascProviderToken?: string;
};

export const apps: Record<AppKey, AppMeta> = {
  crossword: {
    key: "crossword",
    slug: "crossword",
    icon: "/icons/crossword.png",
    released: true,
    appStoreUrl: "https://apps.apple.com/app/id6761682839",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.ullim.crossword",
    // TODO: ASC 에서 Provider Token 확보 후 채운다. 그때까지 iOS 유입은
    //       캠페인 구분 없이 집계된다 (Android 는 referrer 로 이미 구분됨).
    ascProviderToken: undefined,
  },
  minesweeper: {
    key: "minesweeper",
    slug: "minesweeper",
    icon: "/icons/minesweeper.png",
    released: true,
    appStoreUrl: "https://apps.apple.com/app/id6761655927",
  },
  jotDaily: {
    key: "jotDaily",
    slug: "jot-daily",
    icon: "/icons/jot-daily.png",
    released: true,
    appStoreUrl: "https://apps.apple.com/app/id6762282342",
  },
};

export const appList: AppMeta[] = [
  apps.crossword,
  apps.minesweeper,
  apps.jotDaily,
];

export function getAppHref(meta: AppMeta, locale: Locale): string {
  return `/${locale}/${meta.slug}`;
}
