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
