"use client";

import dynamic from "next/dynamic";

// SSR 완전 비활성화:
// - localStorage, new Date() 등 클라이언트 전용 API 사용
// - hydration 불일치 오류 방지
const KidsMeal = dynamic(() => import("../components/KidsMeal"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "'IBM Plex Sans KR', 'Apple SD Gothic Neo', sans-serif",
        background: "#f9f7f2",
        color: "#9a9080",
      }}
    >
      <span style={{ fontSize: 28 }}>🍱</span>
      <span style={{ fontSize: 14 }}>냠냠뚝딱 불러오는 중…</span>
    </div>
  ),
});

export default function Home() {
  return <KidsMeal />;
}
