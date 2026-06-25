/**
 * 냉털 전용 Gemini API 라우트
 *
 * 수정 사항:
 *  - gemini-1.5-flash 사용 (안정적, 무료)
 *  - responseMimeType 제거 (호환성 문제 방지)
 *  - 텍스트에서 JSON 추출 처리 강화
 *  - AbortSignal로 8초 타임아웃 추가
 *
 * 환경변수: GEMINI_API_KEY=AIza...
 * 발급: https://aistudio.google.com → Get API key (무료)
 * 무료 한도: gemini-1.5-flash — 15회/분, 1,500회/일
 */
export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ code: "NO_API_KEY" });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

  try {
    const { prompt } = await req.json();

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await upstream.json();

    if (data.error) {
      return Response.json(
        { error: `Gemini 오류: ${data.error.message}` },
        { status: 500 }
      );
    }

    // 텍스트 추출 + 마크다운 코드블록 제거
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const text = raw.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, m =>
      m.replace(/```json?|```/g, "").trim()
    ).trim();

    return Response.json({ text });
  } catch (err) {
    const msg = err.name === "AbortError"
      ? "응답 시간이 초과됐어요 (8초). 다시 시도해주세요."
      : String(err);
    return Response.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
