/**
 * 냉털 전용 Gemini API 라우트
 *
 * - GEMINI_API_KEY 없으면 { code:"NO_API_KEY" } 반환 → 앱이 로컬 매칭으로 자동 전환
 * - responseMimeType:'application/json' → Gemini가 항상 파싱 가능한 JSON 반환
 *
 * 환경변수:
 *   .env.local / Vercel Settings → Environment Variables
 *   GEMINI_API_KEY=AIza...
 *
 * 무료 한도 (Google AI Studio):
 *   gemini-2.0-flash — 15회/분, 1,500회/일
 */
export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ code: "NO_API_KEY" });
  }

  try {
    const { prompt } = await req.json();

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,           // 다양성 최대
            maxOutputTokens: 2048,
            responseMimeType: "application/json", // 항상 유효한 JSON 반환 보장
          },
        }),
      }
    );

    const data = await upstream.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
