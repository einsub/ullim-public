import { NextRequest, NextResponse, after } from "next/server";
import { apps } from "@/lib/apps";
import { locales, defaultLocale, type Locale } from "@/i18n";
import {
  CAMPAIGNS,
  isCampaignKey,
  storeUrl,
  type CampaignKey,
  type StorePlatform,
} from "@/lib/storeLinks";
import { sendGa4Event } from "@/lib/ga4";

export const runtime = "nodejs";

/**
 * GET /{locale}/crossword/get?src=<brag|sos|web>&p=<ios|android>
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
 * 답변 페이지가 그대로 열려야 한다. 그 페이지 하단의 설치 배지는 여기를 거친다.
 *
 * 이 경로는 유입 측정 지점이기도 하다. 스토어로 나가는 마지막 순간이라
 * "자랑 카드가 실제로 몇 번 눌렸는가" 를 정확히 셀 수 있는 유일한 자리다.
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

  // 유입 경로. 파라미터가 없으면 자랑 카드로 본다 — 카카오 자랑 템플릿의
  // 버튼만이 이 경로를 파라미터 없이 가리키고 있고, 그건 앱에 이미 배포된
  // 링크라 바꾸려면 재배포가 필요하다. 다른 진입점은 모두 src 를 명시한다.
  const srcParam = req.nextUrl.searchParams.get("src");
  const src: CampaignKey = isCampaignKey(srcParam) ? srcParam : "brag";

  // 플랫폼 명시 override. SOS 페이지처럼 양쪽 배지를 나란히 놓는 화면에서는
  // UA 로 판별하면 안 된다 — 아이폰에서 Play 배지를 누른 사람을 App Store 로
  // 끌고 가버린다. 누른 배지가 곧 의도이므로 그쪽을 따른다.
  const pParam = req.nextUrl.searchParams.get("p");
  const forced: StorePlatform | null =
    pParam === "ios" || pParam === "android" ? pParam : null;

  // iPadOS 13+ 는 Macintosh 로 위장하지만, 그 경우 랜딩 페이지로 가도 무방하다.
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const platform: StorePlatform | null =
    forced ?? (isAndroid ? "android" : isIOS ? "ios" : null);

  const campaign = CAMPAIGNS[src];
  const storeTarget = platform ? storeUrl(app, platform, campaign) : undefined;

  // 데스크톱·봇·판별 불가 → 랜딩 페이지에서 직접 고르게 한다
  const target = storeTarget ?? `/${lc}/${app.slug}`;

  // 응답을 붙들지 않도록 리다이렉트 뒤로 미룬다.
  after(() =>
    sendGa4Event("store_redirect", {
      src,
      platform: platform ?? "unknown",
      locale: lc,
      app: app.key,
      // 스토어까지 갔는지, 랜딩으로 떨어졌는지. 후자가 많으면 UA 판별이
      // 새고 있다는 신호다.
      outcome: storeTarget ? "store" : "landing",
    }),
  );

  const res = NextResponse.redirect(new URL(target, req.url), 302);
  // UA 마다 목적지가 다르므로 절대 캐시되면 안 된다.
  // 캐시되면 한쪽 플랫폼 사용자가 반대편 스토어로 끌려간다.
  res.headers.set("Cache-Control", "no-store");
  return res;
}
