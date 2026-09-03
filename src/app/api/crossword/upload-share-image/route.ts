import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

// ── 남용 방지 ──
// 이 엔드포인트는 인증이 없다. 앱이 카카오 템플릿의 ${IMAGE_URL} 에 넣을 공개 URL 을
// 받아가야 하는데, 앱에 심은 비밀값은 결국 추출되므로 인증으로 막는 의미가 적다.
//
// 분산 저장소(KV/Redis)가 없어 인스턴스 메모리로만 제한한다. 인스턴스가 여러 개면
// 새어나가므로 완전한 방어가 아니라 단순 스크립트성 남용을 늦추는 용도다.
// 저장량 자체의 상한은 cleanup-share-images cron 이 담당한다.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const SWEEP_THRESHOLD = 200; // Map 이 이보다 커지면 만료 항목 정리

const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // 매 요청마다 전수 정리하면 O(n) 이므로 커졌을 때만 쓸어낸다
  if (hits.size > SWEEP_THRESHOLD) {
    for (const [k, ts] of hits) {
      const alive = ts.filter((t) => t > cutoff);
      if (alive.length) hits.set(k, alive);
      else hits.delete(k);
    }
  }

  const mine = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  if (mine.length >= MAX_PER_WINDOW) {
    hits.set(ip, mine);
    return true;
  }
  mine.push(now);
  hits.set(ip, mine);
  return false;
}

/**
 * POST /api/crossword/upload-share-image
 *
 * 자랑 이미지를 Vercel Blob에 업로드하고 공개 URL을 반환한다.
 * 요청: multipart/form-data, field name "image" (PNG 또는 JPEG)
 * 응답: { url: "https://..." }
 *
 * Why: 카카오 메시지 템플릿의 ${IMAGE_URL} 변수에 동적 이미지를 주입하려면
 *      외부에서 접근 가능한 URL이 필요하다. @react-native-kakao SDK는 직접
 *      이미지 업로드 API를 노출하지 않으므로 자체 호스팅이 필요.
 */
export async function POST(req: NextRequest) {
  // 본문(최대 2MB)을 읽기 전에 먼저 막는다
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'multipart/form-data required' },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 });
  }

  const file = formData.get('image');
  if (!file || typeof file === 'string' || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'image field required (file)' },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `unsupported content type: ${file.type}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_SIZE} bytes)` },
      { status: 413 },
    );
  }

  const id = crypto.randomUUID();
  const ext = file.type === 'image/jpeg' ? 'jpg' : 'png';
  const pathname = `crossword/share/${id}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('[upload-share-image] blob put failed:', e);
    return NextResponse.json({ error: 'upload failed' }, { status: 500 });
  }
}
