/**
 * GA4 Measurement Protocol — 서버에서 직접 이벤트를 보낸다.
 *
 * Why: 스토어로 보내는 `/{locale}/crossword/get` 은 302 리다이렉트라 브라우저에
 *      스크립트가 실행되지 않는다. @vercel/analytics 도 클라이언트 스크립트라
 *      이 클릭을 잡지 못한다. 서버에서 쏘는 것이 유일한 관측 경로다.
 *
 * 이걸 앱과 같은 GA4 property 로 보내는 이유: brag_shared(앱) → 스토어 클릭(웹)
 * → first_open(앱) 퍼널을 한 화면에서 보기 위해서다. 앱 스트림에는 Measurement
 * Protocol 로 쏠 수 없으므로(app_instance_id 가 필요한데 웹 방문자에겐 없다)
 * 같은 property 안에 웹 데이터 스트림을 따로 두고 그쪽으로 보낸다.
 */

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const API_SECRET = process.env.GA4_API_SECRET;

const ENDPOINT = "https://www.google-analytics.com/mp/collect";

export type Ga4Params = Record<string, string | number | undefined>;

/**
 * 이벤트 하나를 GA4 로 보낸다. 환경변수가 없으면 조용히 아무것도 하지 않는다.
 *
 * 절대 throw 하지 않는다 — 계측 실패가 사용자의 스토어 이동을 막으면 안 된다.
 */
export async function sendGa4Event(
  name: string,
  params: Ga4Params,
): Promise<void> {
  if (!MEASUREMENT_ID || !API_SECRET) return;

  // client_id 를 요청마다 새로 만든다.
  //
  // 리다이렉트 직후 사용자는 스토어로 떠나므로 쿠키를 심어도 다시 읽을 기회가
  // 없다. IP·UA 해시로 안정적인 id 를 만드는 방법도 있지만 그건 사실상
  // 개인 식별자다. 클릭 수(eventCount)만 정확하면 목적을 달성하므로 익명
  // UUID 를 쓴다. 대신 GA4 의 사용자 수 지표는 이 스트림에서 신뢰할 수 없다.
  const clientId = crypto.randomUUID();

  const payload = {
    client_id: clientId,
    events: [
      {
        name,
        params: {
          ...stripUndefined(params),
          // 이 둘이 없으면 GA4 가 세션으로 집계하지 않아 실시간·획득 보고서에
          // 나타나지 않는다.
          session_id: Date.now().toString(),
          engagement_time_msec: 1,
        },
      },
    ],
  };

  const url = `${ENDPOINT}?measurement_id=${encodeURIComponent(
    MEASUREMENT_ID,
  )}&api_secret=${encodeURIComponent(API_SECRET)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      // 계측이 응답을 오래 붙들지 않게 한다.
      signal: AbortSignal.timeout(3000),
    });
    // MP 는 페이로드가 잘못돼도 2xx 를 준다. 네트워크 수준 실패만 알 수 있다.
    if (!res.ok) {
      console.warn(`[ga4] ${name} 전송 실패: HTTP ${res.status}`);
    }
  } catch (e) {
    console.warn(`[ga4] ${name} 전송 실패:`, e);
  }
}

function stripUndefined(params: Ga4Params): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
