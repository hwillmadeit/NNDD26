/**
 * 냉털 전용 Gemini API 라우트
 *
 * 모델 우선순위:
 *   1. gemini-2.0-flash        (최신, 무료 15회/분 1500회/일)
 *   2. gemini-2.0-flash-lite   (더 가벼운 버전, 폴백)
 *
 * 환경변수: GEMINI_API_KEY=AIza...
 * 발급: https://aistudio.google.com → Get API key
 */

const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
];

async function callGemini(apiKey, prompt, model, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 2048 },
      }),
    }
  );
  return res.json();
}

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
    ? `\n이미 추천한 메뉴는 제외: ${exclude.join(", ")}`
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

  let lastError = "";

  try {
    for (const model of MODELS) {
      try {
        const data = await callGemini(apiKey, prompt, model, controller.signal);

        // 모델 없음 → 다음 시도
        if (data.error?.code === 404) {
          lastError = `${model}: 404`;
          continue;
        }
        // 기타 에러
        if (data.error) {
          return Response.json(
            { error: `${model}: ${data.error.message} (${data.error.code})` },
            { status: 500 }
          );
        }

        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (!raw) {
          lastError = `${model}: 빈 응답`;
          continue;
        }

        // JSON 추출
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) {
          return Response.json(
            { error: `JSON 추출 실패: ${raw.slice(0, 100)}` },
            { status: 500 }
          );
        }

        return Response.json({ text: match[0], model });

      } catch (e) {
        if (e.name === "AbortError") throw e;
        lastError = `${model}: ${e.message}`;
      }
    }

    // 모든 모델 실패
    return Response.json(
      { error: `사용 가능한 모델 없음. 마지막 오류: ${lastError}` },
      { status: 500 }
    );

  } catch (err) {
    const msg = err.name === "AbortError"
      ? "응답 시간 초과 (9초)"
      : `오류: ${err.message}`;
    return Response.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
