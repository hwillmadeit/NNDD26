/**
 * 냉털 전용 Gemini API 라우트
 * - 서버에서 프롬프트 생성 (클라이언트 단순화)
 * - 에러 메시지를 클라이언트에 상세 전달 (디버깅 용이)
 * - JSON 추출 로직 강화
 */
export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ code: "NO_API_KEY" });

  let ingredients = [], exclude = [];
  try {
    const body = await req.json();
    ingredients = body.ingredients || [];
    exclude     = body.exclude     || [];
  } catch {
    return Response.json({ error: "요청 파싱 실패" }, { status: 400 });
  }

  const avoidLine = exclude.length
    ? `\n이미 추천한 메뉴이므로 반드시 제외: ${exclude.join(", ")}`
    : "";

  const prompt =
    `너는 창의적인 어린이 영양사야.\n` +
    `냉장고 재료: ${ingredients.join(", ")}\n` +
    `이 재료로 아이가 좋아할 서로 다른 장르의 메뉴 3가지를 추천해줘.\n` +
    `(예: 볶음밥·파스타·국물요리처럼 장르가 달라야 함)\n` +
    `간은 순하게, 탄수화물·단백질·채소 균형 맞게.` +
    avoidLine +
    `\n\nJSON 배열 형식으로만 응답해. 마크다운 없이 순수 JSON:\n` +
    `[{"dish":"메뉴명","time":"20분","description":"한 줄 설명","uses":["쓴 재료"],"extra":["추가 재료"],"steps":["1단계","2단계","3단계","4단계"],"tip":"팁"}]`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await res.json();

    // Gemini API 자체 오류
    if (data.error) {
      return Response.json(
        { error: `Gemini: ${data.error.message} (${data.error.code})` },
        { status: 500 }
      );
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) {
      return Response.json({ error: "Gemini 응답이 비어 있어요" }, { status: 500 });
    }

    // JSON 추출 — 마크다운 코드블록 안팎 모두 처리
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return Response.json(
        { error: `JSON 추출 실패. 원본: ${raw.slice(0, 200)}` },
        { status: 500 }
      );
    }

    return Response.json({ text: match[0] });

  } catch (err) {
    const msg = err.name === "AbortError"
      ? "Gemini 응답 시간 초과 (9초)"
      : `fetch 오류: ${err.message}`;
    return Response.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
