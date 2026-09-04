import { NextRequest, NextResponse } from "next/server";
import { apps } from "@/lib/apps";
import { locales, defaultLocale, type Locale } from "@/i18n";

export const runtime = "nodejs";

/**
 * GET /{locale}/crossword/get
 *
 * 기기에 맞는 스토어로 바로 보낸다. 카카오톡 자랑 카드의 버튼 링크가 여기를 가리킨다.
 *
 * Why: 자랑 카드를 받은 친구는 앱이 없는 사람이다. 예전에는 랜딩 페이지로 보냈는데
 *      거기에 App Store 버튼만 있어서 안드로이드 사용자는 설치할 방법이 없었다.
 *      링크를 누른 시점의 User-Agent 로 갈 곳을 정하면 앱 배포 없이 해결된다.
 *
 * 랜딩 페이지(/{locale}/crossword) 자체에는 이 리다이렉트를 걸지 않는다.
 * 거기는 앱 소개와 개인정보처리방침·지원 페이지로 가는 경로라 일반 방문자가
 * 스토어로 튕기면 안 된다. 그래서 전용 경로를 따로 둔다.
 *
 * SOS 링크는 여기로 보내면 안 된다 — 친구가 답을 알려주는 것이 목적이므로
 * 답변 페이지가 그대로 열려야 한다.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> },
) {
  const { locale } = await ctx.params;
  const lc: Locale = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : defaultLocale;

  const app = apps.crossword;
  const ua = req.headers.get("user-agent") ?? "";

  // iPadOS 13+ 는 Macintosh 로 위장하지만, 그 경우 랜딩 페이지로 가도 무방하다.
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  let target: string;
  if (isAndroid && app.playStoreUrl) {
    target = app.playStoreUrl;
  } else if (isIOS && app.appStoreUrl) {
    target = app.appStoreUrl;
  } else {
    // 데스크톱·봇·판별 불가 → 랜딩 페이지에서 직접 고르게 한다
    target = `/${lc}/${app.slug}`;
  }

  const res = NextResponse.redirect(new URL(target, req.url), 302);
  // UA 마다 목적지가 다르므로 절대 캐시되면 안 된다.
  // 캐시되면 한쪽 플랫폼 사용자가 반대편 스토어로 끌려간다.
  res.headers.set("Cache-Control", "no-store");
  return res;
}
