/**
 * 냉털 전용 Gemini API 라우트
 *
 * ⚠️  API 키는 반드시 Google AI Studio에서 발급받아야 해요
 *     → https://aistudio.google.com → Get API key (무료)
 *     Google Cloud Console 키는 무료 할당량이 0이에요!
 *
 * 모델 자동 폴백: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash-8b
 * 429/404 오류 시 다음 모델 자동 시도, 전부 실패 시 로컬 매칭으로 조용히 전환
 */

const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
];

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ code: "NO_API_KEY" });

  let ingredients = [], exclude = [];
  try {
    const body = await req.json();
    ingredients = body.ingredients || [];
    exclude     = body.exclude     || [];
  } catch {
    return Response.json({ code: "NO_API_KEY" }); // 파싱 실패 → 로컬 폴백
  }

  const avoidLine = exclude.length
    ? `\n이미 추천한 메뉴는 제외: ${exclude.join(", ")}`
    : "";

  const prompt =
    `너는 창의적인 어린이 영양사야.\n` +
    `냉장고 재료: ${ingredients.join(", ")}\n` +
    `이 재료로 아이가 좋아할 서로 다른 장르의 메뉴 3가지를 추천해줘.\n` +
    `(예: 볶음밥·파스타·국물요리처럼 장르가 달라야 함)\n` +
    `간은 순하게, 탄수화물·단백질·채소 균형 맞게.` +
    avoidLine +
    `\n\nJSON 배열 형식으로만 응답해. 마크다운 없이:\n` +
    `[{"dish":"메뉴명","time":"20분","description":"한 줄 설명","uses":["쓴 재료"],"extra":["추가 재료"],"steps":["1단계","2단계","3단계","4단계"],"tip":"팁"}]`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    for (const model of MODELS) {
      let data;
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
        data = await res.json();
      } catch (e) {
        if (e.name === "AbortError") throw e;
        continue; // 네트워크 오류 → 다음 모델
      }

      const code = data.error?.code;

      // 404(모델 없음), 429(할당량 초과) → 다음 모델 시도
      if (code === 404 || code === 429) continue;

      // 기타 API 에러
      if (data.error) {
        return Response.json({ error: `${model}: ${data.error.message}` }, { status: 500 });
      }

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!raw) continue;

      const match = raw.match(/\[[\s\S]*?\]/);
      if (!match) continue;

      return Response.json({ text: match[0] });
    }

    // 모든 모델 실패 → 로컬 매칭으로 조용히 전환
    return Response.json({ code: "NO_API_KEY" });

  } catch (err) {
    // 타임아웃 포함 모든 예외 → 로컬 매칭으로 조용히 전환
    return Response.json({ code: "NO_API_KEY" });
  } finally {
    clearTimeout(timer);
  }
}
