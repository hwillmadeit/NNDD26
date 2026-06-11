import "./globals.css";

export const metadata = {
  title: "냠냠뚝딱 — 아이 식단 도우미",
  description: "아이의 한 끼를 소박하게 차리는 식단 도우미. 일주일 메뉴 자동 구성, 장보기 목록, 레시피 확인.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600&family=Gamja+Flower&family=Gaegu&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
