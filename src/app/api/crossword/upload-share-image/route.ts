import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

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
