import type { AppMeta } from "./apps";

/**
 * 스토어 링크에 유입 경로(캠페인) 정보를 실어 보낸다.
 *
 * Why: 카카오 자랑/SOS 카드로 들어온 설치와 스토어 자연 유입을 구분할 방법이
 *      기본적으로 없다. 파라미터 없는 스토어 URL 로 보내면 GA4 에서 전부
 *      (direct) 한 덩어리가 된다.
 *
 * 플랫폼마다 수단이 전혀 다르다.
 *
 * - Android: Play Install Referrer. Play URL 의 `referrer` 파라미터가 설치 후
 *   첫 실행까지 전달되고, Firebase Analytics SDK 가 자동으로 읽어 `first_open`
 *   이벤트에 source/medium/campaign 을 붙인다. 앱 코드 수정 불필요.
 *
 * - iOS: 대응물이 없다. Firebase Dynamic Links 는 2025-08 종료됐고 App Store
 *   에는 install referrer 가 없다. 유일한 무료 수단이 App Store 캠페인 링크
 *   (`pt` + `ct`) 인데, 이건 GA4 가 아니라 App Store Connect → App Analytics →
 *   Acquisition → Campaigns 에 집계로만 뜬다. 사용자 단위 연결은 불가능하다.
 *   `pt`(Provider Token) 가 없으면 `ct` 만 붙여봐야 아무 효과가 없으므로,
 *   토큰이 등록되기 전까지는 iOS 링크를 건드리지 않고 그대로 둔다.
 */

export type StorePlatform = "ios" | "android";

export type Campaign = {
  /** utm_source — 유입 매체. 카톡 공유면 "kakao" */
  source: string;
  /** utm_medium — 앱 안의 어느 기능인지. "brag" | "sos" | "web" */
  medium: string;
  /** utm_campaign — 묶어서 볼 단위 */
  campaign: string;
};

/**
 * 앱 내 공유 지점별 캠페인 정의.
 *
 * medium 을 기능 이름으로 두는 이유: 자랑하기와 SOS 는 성격이 다른 유입이다.
 * 자랑은 "재미있어 보여서" 오고 SOS 는 "친구를 도와주러" 온다. 둘을 합치면
 * 어느 쪽이 실제로 설치를 만드는지 알 수 없다.
 */
export const CAMPAIGNS = {
  brag: { source: "kakao", medium: "brag", campaign: "viral" },
  sos: { source: "kakao", medium: "sos", campaign: "viral" },
  web: { source: "ullim", medium: "web", campaign: "landing" },
} as const satisfies Record<string, Campaign>;

export type CampaignKey = keyof typeof CAMPAIGNS;

export function isCampaignKey(v: string | null | undefined): v is CampaignKey {
  return v != null && Object.prototype.hasOwnProperty.call(CAMPAIGNS, v);
}

/** Apple 캠페인 토큰(ct) 상한. 넘기면 Apple 이 조용히 잘라내거나 무시한다. */
const CT_MAX_LENGTH = 40;

/**
 * 플랫폼별 스토어 URL 에 캠페인 파라미터를 붙여 돌려준다.
 * 해당 플랫폼 스토어가 없으면 undefined.
 */
export function storeUrl(
  app: AppMeta,
  platform: StorePlatform,
  campaign: Campaign | null,
): string | undefined {
  const base = platform === "android" ? app.playStoreUrl : app.appStoreUrl;
  if (!base) return undefined;
  if (!campaign) return base;

  const url = new URL(base);

  if (platform === "android") {
    // referrer 값 자체가 utm_* 쿼리스트링이다. URLSearchParams 가 중첩
    // 인코딩(= → %3D, & → %26)까지 처리하므로 수동 인코딩하지 않는다.
    const referrer = new URLSearchParams({
      utm_source: campaign.source,
      utm_medium: campaign.medium,
      utm_campaign: campaign.campaign,
    }).toString();
    url.searchParams.set("referrer", referrer);
    return url.toString();
  }

  // iOS — Provider Token 이 없으면 붙일 게 없다.
  if (!app.ascProviderToken) return base;

  const ct = `${campaign.medium}_${campaign.campaign}`.slice(0, CT_MAX_LENGTH);
  url.searchParams.set("pt", app.ascProviderToken);
  url.searchParams.set("ct", ct);
  url.searchParams.set("mt", "8");
  return url.toString();
}
