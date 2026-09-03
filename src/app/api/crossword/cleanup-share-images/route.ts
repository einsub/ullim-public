import { list, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PREFIX = 'crossword/share/';
const RETENTION_DAYS = 90;
const PAGE = 1000;

/**
 * GET /api/crossword/cleanup-share-images
 *
 * 낱말퀴즈 자랑 이미지 중 RETENTION_DAYS 가 지난 것을 삭제한다.
 * vercel.json 의 cron 이 매일 호출한다.
 *
 * Why: upload-share-image 는 인증이 없어 저장량이 무한히 늘 수 있다. 업로드 쪽
 *      rate limit 은 인스턴스 메모리 기반이라 새어나가므로, 저장량의 실질적인
 *      상한은 이 정리 작업이 만든다. 남용이 있더라도 비용이 유계가 된다.
 *
 * Trade-off: 오래된 카카오톡 메시지의 자랑 이미지는 깨진다. 보존 기간을 90일로
 *            길게 잡아 실사용에서 문제가 되지 않도록 했다.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron 은 CRON_SECRET 이 설정돼 있으면 Authorization 헤더를 붙여 호출한다.
  // 설정되지 않았으면 공개 엔드포인트가 되어버리므로 아예 거부한다.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    );
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let cursor: string | undefined;
  let scanned = 0;
  let deleted = 0;
  let freedBytes = 0;

  try {
    do {
      const res = await list({ prefix: PREFIX, limit: PAGE, cursor });
      scanned += res.blobs.length;

      const stale = res.blobs.filter((b) => b.uploadedAt.getTime() < cutoff);
      if (stale.length > 0) {
        await del(stale.map((b) => b.url));
        deleted += stale.length;
        freedBytes += stale.reduce((sum, b) => sum + b.size, 0);
      }

      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
  } catch (e) {
    console.error('[cleanup-share-images] failed:', e);
    return NextResponse.json(
      { error: 'cleanup failed', scanned, deleted },
      { status: 500 },
    );
  }

  console.log(
    `[cleanup-share-images] scanned=${scanned} deleted=${deleted} freed=${freedBytes}`,
  );
  return NextResponse.json({
    scanned,
    deleted,
    freedBytes,
    retentionDays: RETENTION_DAYS,
  });
}
