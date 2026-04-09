import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Guide",
};

const colors = [
  { name: "Primary", hex: "#4D8F87", rgb: "77, 143, 135", desc: "키 컬러 — 배경, 아이콘" },
  { name: "Primary Dark", hex: "#3A6E68", rgb: "58, 110, 104", desc: "hover, 강조" },
  { name: "Primary Light", hex: "#6AABA3", rgb: "106, 171, 163", desc: "서브 요소, 보조" },
  { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", desc: "텍스트, 전경" },
  { name: "White 70%", hex: "rgba(255,255,255,0.7)", rgb: "—", desc: "보조 텍스트" },
  { name: "White 30%", hex: "rgba(255,255,255,0.3)", rgb: "—", desc: "비활성, 구분선" },
  { name: "Dark", hex: "#1A1A1A", rgb: "26, 26, 26", desc: "라이트 모드 텍스트" },
];

const typeSamples = [
  { text: "ullim", className: "font-[family-name:var(--font-galada)] text-6xl", label: "Galada — 브랜드 워드마크 (Latin)" },
  { text: "울림", className: "font-[family-name:var(--font-gowun-batang)] text-6xl font-bold", label: "Gowun Batang Bold — 브랜드 워드마크 (한글)" },
  { text: "울림", className: "font-[family-name:var(--font-gowun-batang)] text-6xl", label: "Gowun Batang Regular — 본문 제목 (한글)" },
  { text: "The quick brown fox", className: "font-[family-name:var(--font-geist-sans)] text-3xl", label: "Geist Sans — UI / 본문 (Latin)" },
];

export default function BrandGuidePage() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Hero */}
      <section className="bg-[#4D8F87] text-white px-8 py-24 flex flex-col items-center">
        <h1 className="font-[family-name:var(--font-galada)] text-7xl">ullim</h1>
        <p className="font-[family-name:var(--font-gowun-batang)] text-2xl mt-4 text-white/70">
          울림 브랜드 가이드
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-8 py-16 space-y-24">
        {/* Brand Name */}
        <section>
          <SectionTitle>Brand Name</SectionTitle>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div>
              <p className="text-sm text-neutral-500 mb-2">English</p>
              <p className="font-[family-name:var(--font-galada)] text-5xl">ullim</p>
              <p className="text-sm text-neutral-400 mt-3">소문자 표기. 대문자 ULLIM은 로고 SVG에서만 사용.</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-2">Korean</p>
              <p className="font-[family-name:var(--font-gowun-batang)] text-5xl font-bold">울림</p>
              <p className="text-sm text-neutral-400 mt-3">공명, 반향 — 소리가 퍼져나간 뒤에 남는 여운.</p>
            </div>
          </div>
        </section>

        {/* Logo */}
        <section>
          <SectionTitle>Logo</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-[#4D8F87] rounded-2xl p-12 flex flex-col items-center justify-center gap-2">
              <p className="font-[family-name:var(--font-galada)] text-6xl text-white">ullim</p>
              <p className="text-xs text-white/50">on Primary</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-2xl p-12 flex flex-col items-center justify-center gap-2">
              <p className="font-[family-name:var(--font-galada)] text-6xl text-white">ullim</p>
              <p className="text-xs text-white/50">on Dark</p>
            </div>
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-2 border border-neutral-200">
              <p className="font-[family-name:var(--font-galada)] text-6xl text-[#4D8F87]">ullim</p>
              <p className="text-xs text-neutral-400">on White</p>
            </div>
            <div className="bg-[#4D8F87] rounded-2xl p-12 flex flex-col items-center justify-center gap-2">
              <p className="font-[family-name:var(--font-gowun-batang)] text-5xl font-bold text-white">울림</p>
              <p className="text-xs text-white/50">한글 워드마크</p>
            </div>
          </div>
          <div className="mt-6 bg-neutral-50 rounded-xl p-8 text-sm text-neutral-600 space-y-2">
            <p><strong>기본 조합:</strong> 흰색 텍스트 + #4D8F87 배경</p>
            <p><strong>반전 조합:</strong> #4D8F87 텍스트 + 흰색 배경 (밝은 환경)</p>
            <p><strong>다크 조합:</strong> 흰색 텍스트 + 다크 배경 (다크 모드)</p>
            <p><strong>한글 워드마크:</strong> Gowun Batang Bold. 영문과 병기할 때 사용.</p>
          </div>
        </section>

        {/* Favicon / App Icon */}
        <section>
          <SectionTitle>Favicon & App Icon</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-2xl bg-[#4D8F87] flex items-center justify-center">
                <span className="font-[family-name:var(--font-galada)] text-8xl text-white leading-none translate-y-1">u</span>
              </div>
              <p className="text-xs text-neutral-400">128px</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#4D8F87] flex items-center justify-center">
                <span className="font-[family-name:var(--font-galada)] text-5xl text-white leading-none translate-y-0.5">u</span>
              </div>
              <p className="text-xs text-neutral-400">64px</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#4D8F87] flex items-center justify-center">
                <span className="font-[family-name:var(--font-galada)] text-2xl text-white leading-none">u</span>
              </div>
              <p className="text-xs text-neutral-400">32px</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#4D8F87] flex items-center justify-center">
                <span className="font-[family-name:var(--font-galada)] text-xs text-white leading-none">u</span>
              </div>
              <p className="text-xs text-neutral-400">16px</p>
            </div>
          </div>
          <div className="mt-6 bg-neutral-50 rounded-xl p-8 text-sm text-neutral-600 space-y-2">
            <p><strong>구성:</strong> Galada &quot;u&quot; + #4D8F87 원형/라운드 배경 + 흰색 텍스트</p>
            <p><strong>파비콘:</strong> SVG 형식, 글리프를 path로 변환하여 폰트 의존 없이 렌더링</p>
            <p><strong>앱 아이콘:</strong> 동일한 구성, 플랫폼별 사이즈로 내보내기</p>
            <p><strong>라운드:</strong> 큰 사이즈는 원형, 작은 사이즈는 라운드 사각형</p>
          </div>
        </section>

        {/* Colors */}
        <section>
          <SectionTitle>Colors</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {colors.map((c) => (
              <div key={c.name}>
                <div
                  className="h-24 rounded-xl border border-neutral-200"
                  style={{ background: c.hex }}
                />
                <p className="font-medium mt-3 text-sm">{c.name}</p>
                <p className="text-xs text-neutral-400 font-mono">{c.hex}</p>
                <p className="text-xs text-neutral-400 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionTitle>Typography</SectionTitle>
          <div className="space-y-10 mt-8">
            {typeSamples.map((sample) => (
              <div key={sample.label} className="border-b border-neutral-100 pb-8">
                <p className={sample.className}>{sample.text}</p>
                <p className="text-sm text-neutral-400 mt-3">{sample.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-neutral-50 rounded-xl p-8">
            <h3 className="font-semibold text-lg mb-4">Font Pairing Rules</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li><strong>브랜드 표기</strong> — Galada (Latin) + Gowun Batang Bold (한글)</li>
              <li><strong>제목 / 헤드라인</strong> — Gowun Batang Regular (한글) + Geist Sans Medium (Latin)</li>
              <li><strong>본문 / UI</strong> — Geist Sans (Latin + 숫자) + 시스템 고딕 (한글 본문)</li>
              <li><strong>코드 / 데이터</strong> — Geist Mono</li>
            </ul>
          </div>
        </section>

        {/* Tone & Voice */}
        <section>
          <SectionTitle>Tone & Voice</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-neutral-50 rounded-xl p-8">
              <h3 className="font-semibold mb-4">울림은</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>차분하고 깊이 있다</li>
                <li>군더더기 없이 명확하다</li>
                <li>따뜻하지만 과하지 않다</li>
                <li>기능이 곧 미학이다</li>
              </ul>
            </div>
            <div className="bg-neutral-50 rounded-xl p-8">
              <h3 className="font-semibold mb-4">울림은 아니다</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>시끄럽거나 과장된</li>
                <li>차갑거나 기계적인</li>
                <li>장식이 많거나 화려한</li>
                <li>트렌디함을 좇는</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Spacing & Layout */}
        <section>
          <SectionTitle>Spacing Principles</SectionTitle>
          <div className="mt-8 bg-neutral-50 rounded-xl p-8 text-sm text-neutral-600 space-y-3">
            <p><strong>여백은 넉넉하게.</strong> 울림의 "여운"은 공간에서 나온다. 요소 사이에 숨 쉴 공간을 준다.</p>
            <p><strong>정렬은 중앙 또는 좌측.</strong> 중앙 정렬은 랜딩/브랜드, 좌측 정렬은 콘텐츠/도구.</p>
            <p><strong>라운드 코너.</strong> 날카로운 모서리보다 둥근 모서리. 기본 border-radius: 12px~16px.</p>
            <p><strong>투명도 계층.</strong> white/10, white/30, white/70으로 정보의 위계를 표현한다.</p>
          </div>
        </section>

        {/* Domain */}
        <section>
          <SectionTitle>Domain & Naming</SectionTitle>
          <div className="mt-8 text-sm text-neutral-600 space-y-4">
            <div className="flex gap-4 items-baseline">
              <span className="font-mono bg-neutral-100 px-3 py-1 rounded text-xs">ull.im</span>
              <span>메인 도메인</span>
            </div>
            <div className="flex gap-4 items-baseline">
              <span className="font-mono bg-neutral-100 px-3 py-1 rounded text-xs">hub.ull.im</span>
              <span>관리 대시보드</span>
            </div>
            <div className="flex gap-4 items-baseline">
              <span className="font-mono bg-neutral-100 px-3 py-1 rounded text-xs">pages.ull.im</span>
              <span>정적 페이지 (개인정보, 지원)</span>
            </div>
            <div className="flex gap-4 items-baseline">
              <span className="font-mono bg-neutral-100 px-3 py-1 rounded text-xs">ullim studio</span>
              <span>법적/스토어 명칭 (Ullim Studio)</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-neutral-300 pt-8 border-t border-neutral-100">
          ullim brand guide — last updated April 2026
        </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
      {children}
    </h2>
  );
}
