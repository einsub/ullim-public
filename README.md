# ullim-public

Ullim Studio 외부 공개용 웹사이트. 앱 소개, 개인정보 처리방침, 지원 페이지를 제공합니다.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vercel

## Development

```bash
nvm use
npm install
npm run dev
```

## 환경변수

Vercel 프로젝트 설정에서 관리합니다 (`vercel env pull` 로 로컬에 내려받음).

| 이름 | 용도 | 없으면 |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | 자랑 이미지 업로드 (Vercel Blob) | 업로드 실패 |
| `CRON_SECRET` | 자랑 이미지 정리 크론 인증 | 크론 거부 |
| `GA4_MEASUREMENT_ID` | 스토어 유입 측정 (GA4 웹 스트림) | 측정만 생략, 리다이렉트는 정상 |
| `GA4_API_SECRET` | 〃 Measurement Protocol 시크릿 | 〃 |

## Deployment

GitHub main 브랜치에 push하면 Vercel에서 자동 배포됩니다.
