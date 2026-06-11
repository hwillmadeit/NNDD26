/**
 * Anthropic API 프록시
 *
 * - ANTHROPIC_API_KEY 없으면 code:"NO_API_KEY" 반환 (앱이 친절한 안내 메시지 표시)
 * - API 키가 브라우저에 노출되지 않도록 서버에서만 처리
 *
 * 환경변수 설정:
 *   .env.local  →  ANTHROPIC_API_KEY=sk-ant-...
 *   Vercel      →  Settings > Environment Variables
 */
export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // API 키 미설정 시 — 앱은 정상 동작, AI 기능만 안내 메시지 표시
  if (!apiKey) {
    return Response.json({ code: "NO_API_KEY" }, { status: 200 });
  }

  try {
    const body = await req.json();
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (err) {
    return Response.json(
      { error: "upstream_error", message: String(err) },
      { status: 502 }
    );
  }
}
