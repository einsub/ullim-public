// Halil 앱의 이메일 confirmation / OAuth redirect callback.
// Supabase 가 이 page 의 URL 로 redirect 한 후, 사용자를 native 앱(Tauri/iOS/Android)으로
// 다시 보내야 한다. 단순 forward — query param 'code' (PKCE flow) 를
// halil://auth/callback?code=... 로 옮겨 deep link 트리거.
"use client";

import { useEffect, useState } from "react";

export default function HalilAuthCallbackPage() {
  const [status, setStatus] = useState<"redirecting" | "fallback">("redirecting");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      setStatus("fallback");
      return;
    }
    if (!code) {
      setStatus("fallback");
      return;
    }

    // halil:// scheme 으로 redirect — OS deep link 가 native 앱으로 routing.
    const deepLink = `halil://auth/callback?code=${encodeURIComponent(code)}`;
    window.location.href = deepLink;
    // 일부 브라우저는 scheme 처리 후에도 페이지를 닫지 않음. fallback UI 보여주기 위해 timeout.
    const t = setTimeout(() => setStatus("fallback"), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        {status === "redirecting" ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>할일 앱으로 돌아갑니다…</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              자동으로 열리지 않으면 아래 버튼을 눌러주세요.
            </p>
            <a
              href={`halil://auth/callback${typeof window !== "undefined" ? window.location.search : ""}`}
              style={{
                display: "inline-block",
                marginTop: 16,
                padding: "10px 20px",
                background: "#111827",
                color: "white",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              할일 앱 열기
            </a>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>인증을 완료할 수 없었습니다</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              앱에서 다시 로그인을 시도해주세요. 문제가 계속되면 다시 가입 메일을 요청하세요.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
