# 냠냠뚝딱 🍱

아이의 한 끼를 소박하게 차리는 식단 도우미.

**API 키 없이도 배포·사용 가능** — AI 기능(레시피·냉털)은 키 설정 시 활성화됩니다.

---

## 기능

| 기능 | API 키 필요 |
|------|------------|
| 한 주 식단 자동 구성 (MAINS 58종·SIDES 48종·SOUPS 30종) | ❌ |
| 오늘 메뉴 · 끼니 바꾸기 · 직접 편집 | ❌ |
| 장보기 목록 · 재료 자동 취합 | ❌ |
| 제철 식재료 카드 · 메모 | ❌ |
| 오늘 메뉴 레시피 보기 (AI) | ✅ |
| 냉털 — 보유 재료로 AI 레시피 추천 | ✅ |

---

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # API 키 선택 입력
npm run dev                          # http://localhost:3000
```

---

## Vercel 무료 배포

### 1단계 — GitHub push

```bash
git init
git add .
git commit -m "냠냠뚝딱 초기 커밋"
git remote add origin https://github.com/hwillmadeit/NNDD26.git
git push -u origin main
```

### 2단계 — Vercel 연결

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub 레포 선택
2. Framework: **Next.js** (자동 감지)
3. **Deploy** 클릭 — API 키 없이도 즉시 배포됩니다

### 3단계 — AI 기능 활성화 (선택)

Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

추가 후 **Redeploy** → 레시피·냉털 기능 활성화

> API 키 발급: [console.anthropic.com](https://console.anthropic.com) → API Keys

---

## 프로젝트 구조

```
NNDD26/
├── app/
│   ├── layout.js          ← 폰트, 메타데이터
│   ├── page.js            ← 진입점 (SSR 비활성화)
│   ├── globals.css
│   └── api/chat/route.js  ← Anthropic 프록시 (키 보안)
├── components/
│   └── KidsMeal.jsx       ← 앱 전체 (1500+ 줄)
├── .env.local.example
├── .gitignore
└── package.json
```
