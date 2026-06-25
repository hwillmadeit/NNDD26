"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  RefreshCw, ShoppingBasket, Settings, Plus, X, Loader2, ChevronRight, ChevronDown,
  Check, Trash2, Sun, CalendarDays, Refrigerator, PencilLine, Leaf, Edit2, Moon, ChefHat,
  Egg, Fish, Beef, Drumstick, Ham, Soup, Salad, Sandwich, Croissant,
  Milk, Wheat, Carrot, Apple, Banana, Cherry, Grape, Citrus, Utensils, Bean, Snowflake,
} from "lucide-react";

/* ── localStorage adapter (Next.js / Vercel 환경) ── */
const storage = {
  async get(key) {
    if (typeof window === "undefined") return null;
    try { const v = localStorage.getItem(key); return v ? { key, value: v } : null; } catch { return null; }
  },
  async set(key, value) {
    if (typeof window === "undefined") return null;
    try { localStorage.setItem(key, String(value)); return { key, value }; } catch { return null; }
  },
};

/* ================================================================
 *  냠냠뚝딱 — 아이 식단 도우미
 * ============================================================== */
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/* ---- 메뉴 데이터 ---- */
// 아침: 탄수+단백+과일/채소 균형 잡힌 완성형 조합
const BF_MAINS = [
  { name: "계란 토스트 + 우유", icon: Egg, cat: "egg", ing: ["식빵", "계란", "우유"],
    parts: [{ name: "계란 토스트", icon: Sandwich, label: "탄·단" }, { name: "우유 한 컵", icon: Milk, label: "단백" }] },
  { name: "오트밀 + 바나나 + 아몬드", icon: Soup, cat: "grain", ing: ["오트밀", "바나나", "견과"],
    parts: [{ name: "오트밀", icon: Soup, label: "탄수" }, { name: "바나나", icon: Banana, label: "과일" }, { name: "아몬드 한 줌", icon: Bean, label: "지방" }] },
  { name: "단호박죽 + 계란찜", icon: Soup, cat: "egg", ing: ["단호박", "쌀", "계란"],
    parts: [{ name: "단호박죽", icon: Soup, label: "탄수" }, { name: "계란찜", icon: Egg, label: "단백" }] },
  { name: "요거트 그래놀라 + 딸기", icon: Milk, cat: "dairy", ing: ["요거트", "그래놀라", "딸기"],
    parts: [{ name: "요거트 그래놀라", icon: Milk, label: "탄·단" }, { name: "딸기", icon: Cherry, label: "과일" }] },
  { name: "치즈 토스트 + 귤", icon: Sandwich, cat: "dairy", ing: ["식빵", "치즈", "귤"],
    parts: [{ name: "치즈 토스트", icon: Sandwich, label: "탄·단" }, { name: "귤", icon: Citrus, label: "과일" }] },
  { name: "두유 + 모닝빵 + 견과", icon: Croissant, cat: "grain", ing: ["두유", "모닝빵", "견과"],
    parts: [{ name: "모닝빵", icon: Croissant, label: "탄수" }, { name: "두유", icon: Milk, label: "단백" }, { name: "견과 한 줌", icon: Bean, label: "지방" }] },
  { name: "바나나 팬케이크 + 두유", icon: Croissant, cat: "grain", ing: ["핫케이크가루", "바나나", "계란", "두유"],
    parts: [{ name: "바나나 팬케이크", icon: Croissant, label: "탄수" }, { name: "두유 한 컵", icon: Milk, label: "단백" }] },
  { name: "계란밥 + 방울토마토", icon: Egg, cat: "egg", ing: ["밥", "계란", "방울토마토"],
    parts: [{ name: "계란밥", icon: Egg, label: "탄·단" }, { name: "방울토마토", icon: Cherry, label: "채소" }] },
  { name: "주먹밥 + 계란국 + 사과", icon: Utensils, cat: "egg", ing: ["밥", "김", "계란", "사과"],
    parts: [{ name: "주먹밥", icon: Utensils, label: "탄수" }, { name: "계란국", icon: Soup, label: "단백" }, { name: "사과", icon: Apple, label: "과일" }] },
  { name: "미니 김밥 + 두유", icon: Utensils, cat: "grain", ing: ["밥", "김", "단무지", "당근", "두유"],
    parts: [{ name: "미니 김밥", icon: Utensils, label: "탄수" }, { name: "두유 한 컵", icon: Milk, label: "단백" }] },
  { name: "찐 고구마 + 요거트 + 블루베리", icon: Carrot, cat: "dairy", ing: ["고구마", "요거트", "블루베리"],
    parts: [{ name: "찐 고구마", icon: Carrot, label: "탄수" }, { name: "요거트", icon: Milk, label: "단백" }, { name: "블루베리", icon: Cherry, label: "과일" }] },
  { name: "시리얼 + 우유 + 사과", icon: Milk, cat: "dairy", ing: ["시리얼", "우유", "사과"],
    parts: [{ name: "시리얼", icon: Wheat, label: "탄수" }, { name: "우유", icon: Milk, label: "단백" }, { name: "사과", icon: Apple, label: "과일" }] },
  { name: "두부 계란밥 + 김구이", icon: Bean, cat: "egg", ing: ["밥", "두부", "계란", "김"],
    parts: [{ name: "두부 계란밥", icon: Bean, label: "탄·단" }, { name: "김구이", icon: Salad, label: "채소" }] },
  { name: "잼 토스트 + 삶은 계란 + 귤", icon: Sandwich, cat: "egg", ing: ["식빵", "잼", "계란", "귤"],
    parts: [{ name: "잼 토스트", icon: Sandwich, label: "탄수" }, { name: "삶은 계란", icon: Egg, label: "단백" }, { name: "귤", icon: Citrus, label: "과일" }] },
  { name: "누룽지 + 달걀찜 + 방울토마토", icon: Wheat, cat: "egg", ing: ["누룽지", "계란", "방울토마토"],
    parts: [{ name: "누룽지", icon: Wheat, label: "탄수" }, { name: "달걀찜", icon: Egg, label: "단백" }, { name: "방울토마토", icon: Cherry, label: "채소" }] },
  { name: "감자수프 + 치즈 토스트", icon: Soup, cat: "dairy", ing: ["감자", "두유", "식빵", "치즈"],
    parts: [{ name: "감자수프", icon: Soup, label: "탄수" }, { name: "치즈 토스트", icon: Sandwich, label: "단·지" }] },
  { name: "오트밀 + 견과 + 딸기", icon: Soup, cat: "grain", ing: ["오트밀", "견과", "딸기"],
    parts: [{ name: "오트밀", icon: Soup, label: "탄수" }, { name: "견과 한 줌", icon: Bean, label: "지방" }, { name: "딸기", icon: Cherry, label: "과일" }] },
  { name: "바나나우유 + 토스트 + 계란", icon: Milk, cat: "egg", ing: ["바나나우유", "식빵", "계란"],
    parts: [{ name: "바나나우유", icon: Milk, label: "단백" }, { name: "계란 토스트", icon: Egg, label: "탄·단" }] },
  { name: "요거트 + 과일 컵 + 견과", icon: Milk, cat: "dairy", ing: ["요거트", "사과", "견과"],
    parts: [{ name: "플레인 요거트", icon: Milk, label: "단백" }, { name: "과일 컵", icon: Apple, label: "과일" }, { name: "견과 한 줌", icon: Bean, label: "지방" }] },
];
const MAINS = [
  { name: "소불고기 덮밥", icon: Beef, cat: "beef", style: "k", ing: ["소고기", "양파", "간장", "밥"] },
  { name: "소고기 채소볶음밥", icon: Beef, cat: "beef", style: "k", ing: ["소고기", "당근", "양파", "밥"] },
  { name: "닭갈비 덮밥", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "양배추", "당근", "밥"] },
  { name: "닭 채소볶음밥", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "당근", "양파", "밥"] },
  { name: "닭곰탕 정식", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "대파", "밥"] },
  { name: "오므라이스", icon: Egg, cat: "egg", style: "k", ing: ["계란", "밥", "케첩", "당근"] },
  { name: "새우 볶음밥", icon: Fish, cat: "fish", style: "k", ing: ["새우", "당근", "양파", "밥"] },
  { name: "순한 제육 덮밥", icon: Ham, cat: "pork", style: "k", ing: ["돼지고기", "양파", "밥"] },
  { name: "순한 카레라이스", icon: Utensils, cat: "chicken", style: "k", ing: ["닭고기", "감자", "당근", "카레", "밥"] },
  { name: "고등어구이 정식", icon: Fish, cat: "fish", style: "k", ing: ["고등어", "밥"] },
  { name: "두부 스테이크 덮밥", icon: Bean, cat: "tofu", style: "k", ing: ["두부", "양파", "밥", "간장"] },
  { name: "두부 덮밥", icon: Bean, cat: "tofu", style: "k", ing: ["두부", "대파", "간장", "밥"] },
  { name: "잡채밥", icon: Salad, cat: "veg", style: "k", ing: ["당면", "시금치", "당근", "밥"] },
  { name: "미트볼 덮밥", icon: Beef, cat: "beef", style: "w", ing: ["소고기", "양파", "케첩", "밥"] },
  { name: "돈가스 정식", icon: Ham, cat: "pork", style: "k", ing: ["돼지고기", "빵가루", "밥"] },
  { name: "채소 김치볶음밥", icon: Utensils, cat: "veg", style: "k", ing: ["김치", "당근", "밥"] },
  { name: "비빔밥", icon: Salad, cat: "veg", style: "k", ing: ["밥", "시금치", "당근", "애호박"] },
  { name: "함박 스테이크", icon: Beef, cat: "beef", style: "w", ing: ["소고기", "양파", "밥"] },
  { name: "멸치 주먹밥 정식", icon: Fish, cat: "fish", style: "k", ing: ["멸치", "김", "밥"] },
  { name: "참치 비빔밥(순한)", icon: Fish, cat: "fish", style: "k", ing: ["참치", "당근", "밥"] },
  { name: "주꾸미 채소볶음밥", icon: Fish, cat: "fish", style: "k", ing: ["주꾸미", "당근", "양파", "밥"] },
  { name: "꽃게탕 정식", icon: Fish, cat: "fish", style: "k", ing: ["꽃게", "무", "밥"] },
  { name: "전어구이 정식", icon: Fish, cat: "fish", style: "k", ing: ["전어", "밥"] },
  { name: "대하구이 정식", icon: Fish, cat: "fish", style: "k", ing: ["대하", "밥"] },
  { name: "삼치구이 정식", icon: Fish, cat: "fish", style: "k", ing: ["삼치", "밥"] },
  { name: "봄동 비빔밥", icon: Salad, cat: "veg", style: "k", ing: ["봄동", "밥", "당근"] },
  { name: "짜장 덮밥(순한)", icon: Utensils, cat: "pork", style: "c", ing: ["돼지고기", "양파", "춘장", "밥"] },
  { name: "크림 파스타", icon: Wheat, cat: "dairy", style: "w", ing: ["파스타면", "우유", "치즈", "양파"] },
  { name: "나폴리탄 스파게티", icon: Wheat, cat: "pork", style: "w", ing: ["파스타면", "햄", "양파"] },
  { name: "토마토 미트소스 파스타", icon: Wheat, cat: "beef", style: "w", ing: ["파스타면", "소고기", "토마토소스"] },
  { name: "계란 초밥 세트", icon: Egg, cat: "egg", style: "j", ing: ["계란", "밥"] },
  { name: "어묵 우동", icon: Soup, cat: "fish", style: "j", ing: ["우동면", "어묵", "대파"] },
  { name: "찹스테이크 덮밥", icon: Beef, cat: "beef", style: "w", ing: ["소고기", "파프리카", "양파", "밥"] },
  { name: "오야코동", icon: Drumstick, cat: "chicken", style: "j", ing: ["닭고기", "계란", "양파", "밥"] },
  { name: "어린이 샤브샤브 정식", icon: Soup, cat: "beef", style: "k", ing: ["소고기", "배추", "당면", "밥"] },
  { name: "새우 볶음 우동", icon: Fish, cat: "fish", style: "j", ing: ["우동면", "새우", "양배추"] },
  { name: "닭 야키소바", icon: Drumstick, cat: "chicken", style: "j", ing: ["소바면", "닭고기", "양배추"] },
  { name: "순한 마파두부 덮밥", icon: Bean, cat: "tofu", style: "c", ing: ["두부", "돼지고기", "밥", "양파"] },

  { name: "낙지 채소볶음밥", icon: Fish, cat: "fish", style: "k", ing: ["낙지", "당근", "양파", "밥"] },
  { name: "오징어 채소볶음밥", icon: Fish, cat: "fish", style: "k", ing: ["오징어", "당근", "양파", "밥"] },
  { name: "달걀 볶음밥", icon: Egg, cat: "egg", style: "k", ing: ["계란", "당근", "밥"] },
  { name: "소시지 야채볶음밥", icon: Ham, cat: "pork", style: "k", ing: ["소시지", "당근", "양파", "밥"] },
  { name: "닭강정 덮밥", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "전분", "밥"] },
  { name: "갈비찜 정식", icon: Beef, cat: "beef", style: "k", ing: ["소고기", "당근", "밥"] },
  { name: "닭조림 정식", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "감자", "밥"] },
  { name: "연어구이 정식", icon: Fish, cat: "fish", style: "j", ing: ["연어", "밥"] },
  { name: "소고기 온센달걀 덮밥", icon: Beef, cat: "beef", style: "j", ing: ["소고기", "계란", "밥"] },
  { name: "닭가라아게 덮밥", icon: Drumstick, cat: "chicken", style: "j", ing: ["닭고기", "전분", "밥"] },
  { name: "교자 정식", icon: Utensils, cat: "pork", style: "c", ing: ["돼지고기", "양배추", "밀가루"] },
  { name: "볶음 짬뽕밥", icon: Utensils, cat: "pork", style: "c", ing: ["돼지고기", "양파", "당근", "밥"] },
  { name: "미트볼 토마토 파스타", icon: Beef, cat: "beef", style: "w", ing: ["소고기", "파스타면", "토마토소스"] },
  { name: "닭가슴살 샐러드 덮밥", icon: Drumstick, cat: "chicken", style: "w", ing: ["닭고기", "양상추", "밥"] },
  { name: "어묵 볶음밥", icon: Fish, cat: "fish", style: "k", ing: ["어묵", "당근", "밥"] },
  { name: "콩나물 불고기밥", icon: Beef, cat: "beef", style: "k", ing: ["소고기", "콩나물", "밥"] },
  { name: "새우 케첩볶음밥", icon: Fish, cat: "fish", style: "c", ing: ["새우", "계란", "밥"] },
  { name: "단호박 치킨 카레", icon: Drumstick, cat: "chicken", style: "k", ing: ["닭고기", "단호박", "카레가루", "밥"] },
  { name: "참치마요 덮밥", icon: Fish, cat: "fish", style: "j", ing: ["참치", "마요", "밥"] },
  { name: "두부김치 덮밥", icon: Bean, cat: "tofu", style: "k", ing: ["두부", "김치", "밥"] },
  { name: "갈치구이 정식", icon: Fish, cat: "fish", style: "k", ing: ["갈치", "밥"] },
  { name: "낙지볶음 정식", icon: Fish, cat: "fish", style: "k", ing: ["낙지", "애호박", "밥"] },
  { name: "방어 데리야키 덮밥", icon: Fish, cat: "fish", style: "j", ing: ["방어", "밥"] },
];
const SIDES = [
  { name: "시금치나물", icon: Salad, cat: "veg", style: "k", ing: ["시금치", "참기름"] },
  { name: "애호박볶음", icon: Salad, cat: "veg", style: "k", ing: ["애호박"] },
  { name: "계란말이", icon: Egg, cat: "egg", style: "*", ing: ["계란", "당근"] },
  { name: "감자조림", icon: Carrot, cat: "veg", style: "k", ing: ["감자", "간장"] },
  { name: "멸치볶음", icon: Fish, cat: "fish", style: "k", ing: ["멸치"] },
  { name: "당근볶음", icon: Carrot, cat: "veg", ing: ["당근"] },
  { name: "어묵볶음", icon: Fish, cat: "fish", style: "k", ing: ["어묵", "양파"] },
  { name: "콩나물무침", icon: Salad, cat: "veg", style: "k", ing: ["콩나물"] },
  { name: "두부조림", icon: Bean, cat: "tofu", style: "k", ing: ["두부", "간장"] },
  { name: "김구이", icon: Salad, cat: "veg", style: "*", ing: ["김"] },
  { name: "가지볶음", icon: Salad, cat: "veg", style: "k", ing: ["가지"] },
  { name: "감자채볶음", icon: Carrot, cat: "veg", style: "k", ing: ["감자"] },
  { name: "양배추찜", icon: Salad, cat: "veg", ing: ["양배추"] },
  { name: "단호박찜", icon: Carrot, cat: "veg", style: "*", ing: ["단호박"] },
  { name: "두부부침", icon: Bean, cat: "tofu", ing: ["두부", "간장"] },
  { name: "취나물무침", icon: Salad, cat: "veg", style: "k", ing: ["취나물"] },
  { name: "참나물무침", icon: Salad, cat: "veg", style: "k", ing: ["참나물"] },
  { name: "달래무침", icon: Salad, cat: "veg", style: "k", ing: ["달래"] },
  { name: "고사리나물", icon: Salad, cat: "veg", style: "k", ing: ["고사리"] },
  { name: "버섯볶음", icon: Salad, cat: "veg", style: "*", ing: ["버섯"] },
  { name: "콘 샐러드", icon: Salad, cat: "veg", style: "w", ing: ["옥수수"] },
  { name: "그린 샐러드", icon: Salad, cat: "veg", style: "w", ing: ["양상추", "당근"] },
  { name: "오이 스틱", icon: Salad, cat: "veg", style: "*", ing: ["오이"] },

  { name: "시금치 참깨무침", icon: Salad, cat: "veg", style: "k", ing: ["시금치"] },
  { name: "연근조림", icon: Carrot, cat: "veg", style: "k", ing: ["연근", "간장"] },
  { name: "양배추 볶음", icon: Salad, cat: "veg", style: "k", ing: ["양배추"] },
  { name: "콩자반", icon: Bean, cat: "veg", style: "k", ing: ["검은콩", "간장"] },
  { name: "두부구이", icon: Bean, cat: "tofu", style: "k", ing: ["두부"] },
  { name: "파프리카볶음", icon: Carrot, cat: "veg", style: "*", ing: ["파프리카"] },
  { name: "표고버섯볶음", icon: Salad, cat: "veg", style: "*", ing: ["표고버섯"] },
  { name: "오이무침", icon: Salad, cat: "veg", style: "k", ing: ["오이"] },
  { name: "청경채볶음", icon: Salad, cat: "veg", style: "c", ing: ["청경채"] },
  { name: "옥수수 버터볶음", icon: Carrot, cat: "veg", style: "w", ing: ["옥수수", "버터"] },
  { name: "아스파라거스볶음", icon: Salad, cat: "veg", style: "w", ing: ["아스파라거스"] },
  { name: "감자 샐러드", icon: Carrot, cat: "veg", style: "w", ing: ["감자", "마요"] },
  { name: "소시지볶음", icon: Ham, cat: "pork", style: "k", ing: ["소시지", "양파"] },
  { name: "알감자조림", icon: Carrot, cat: "veg", style: "k", ing: ["알감자", "간장"] },
  { name: "오징어채볶음", icon: Fish, cat: "fish", style: "k", ing: ["오징어채"] },
  { name: "가지무침", icon: Salad, cat: "veg", style: "k", ing: ["가지"] },
  { name: "호박나물", icon: Salad, cat: "veg", style: "k", ing: ["애호박"] },
  { name: "무나물", icon: Carrot, cat: "veg", style: "k", ing: ["무"] },
  { name: "당근볶음", icon: Carrot, cat: "veg", style: "*", ing: ["당근"] },
  { name: "맛살볶음", icon: Fish, cat: "fish", style: "k", ing: ["맛살", "양파"] },
  { name: "콘 샐러드", icon: Salad, cat: "veg", style: "w", ing: ["옥수수"] },
  { name: "그린 샐러드", icon: Salad, cat: "veg", style: "w", ing: ["양상추", "당근"] },
  { name: "오이 스틱", icon: Salad, cat: "veg", style: "*", ing: ["오이"] },
  { name: "로메인 샐러드", icon: Salad, cat: "veg", style: "w", ing: ["양상추", "토마토"] },
  { name: "건새우 달걀볶음", icon: Fish, cat: "egg", style: "k", ing: ["건새우", "계란"] },
  { name: "두릅나물", icon: Salad, cat: "veg", style: "k", ing: ["두릅"] },
  { name: "깻잎볶음", icon: Salad, cat: "veg", style: "k", ing: ["깻잎"] },
  { name: "우엉조림", icon: Carrot, cat: "veg", style: "k", ing: ["우엉", "간장"] },
  { name: "연근볶음", icon: Carrot, cat: "veg", style: "k", ing: ["연근"] },
];
const SOUPS = [
  { name: "미역국", icon: Soup, cat: "veg", style: "k", ing: ["미역"] },
  { name: "소고기 미역국", icon: Soup, cat: "beef", style: "k", ing: ["소고기", "미역"] },
  { name: "된장국", icon: Soup, cat: "veg", style: "*", ing: ["된장", "두부", "애호박"] },
  { name: "소고기무국", icon: Soup, cat: "beef", style: "k", ing: ["소고기", "무"] },
  { name: "콩나물국", icon: Soup, cat: "veg", style: "*", ing: ["콩나물"] },
  { name: "계란국", icon: Soup, cat: "egg", style: "*", ing: ["계란", "대파"] },
  { name: "어묵국", icon: Soup, cat: "fish", style: "k", ing: ["어묵", "무"] },
  { name: "시금치 된장국", icon: Soup, cat: "veg", style: "k", ing: ["시금치", "된장"] },
  { name: "맑은 무국", icon: Soup, cat: "veg", style: "*", ing: ["무"] },
  { name: "순한 두부김치국", icon: Soup, cat: "tofu", style: "k", ing: ["두부", "김치"] },
  { name: "감자국", icon: Soup, cat: "veg", style: "k", ing: ["감자", "양파"] },
  { name: "애호박 된장국", icon: Soup, cat: "veg", style: "k", ing: ["애호박", "된장"] },
  { name: "콩나물 무국", icon: Soup, cat: "veg", style: "*", ing: ["콩나물", "무"] },
  { name: "두부 된장국", icon: Soup, cat: "tofu", style: "*", ing: ["두부", "된장"] },
  { name: "냉이 된장국", icon: Soup, cat: "veg", style: "k", ing: ["냉이", "된장"] },
  { name: "바지락 된장국", icon: Soup, cat: "fish", style: "k", ing: ["바지락", "된장"] },
  { name: "굴 미역국", icon: Soup, cat: "fish", style: "k", ing: ["굴", "미역"] },
  { name: "꽃게 된장국", icon: Soup, cat: "fish", style: "k", ing: ["꽃게", "된장"] },
  { name: "크림 수프", icon: Soup, cat: "dairy", style: "w", ing: ["우유", "양파", "감자"] },
  { name: "토마토 수프", icon: Soup, cat: "veg", style: "w", ing: ["양파", "당근"] },
  { name: "북어국", icon: Soup, cat: "fish", style: "k", ing: ["북어", "계란"] },
  { name: "들깨 감자국", icon: Soup, cat: "veg", style: "k", ing: ["감자", "들깨"] },
  { name: "소고기 감자국", icon: Soup, cat: "beef", style: "k", ing: ["소고기", "감자"] },
  { name: "버섯 계란국", icon: Soup, cat: "egg", style: "k", ing: ["버섯", "계란"] },
  { name: "새우 된장국", icon: Soup, cat: "fish", style: "k", ing: ["새우", "된장", "두부"] },
  { name: "두부 계란국", icon: Soup, cat: "egg", style: "k", ing: ["두부", "계란"] },
  { name: "시래기국", icon: Soup, cat: "veg", style: "k", ing: ["시래기", "된장"] },
  { name: "순두부국", icon: Soup, cat: "tofu", style: "k", ing: ["순두부", "계란"] },
  { name: "오이냉국", icon: Soup, cat: "veg", style: "k", ing: ["오이"] },
  { name: "팽이버섯국", icon: Soup, cat: "veg", style: "k", ing: ["팽이버섯", "계란"] },
];

const SLOTS = [
  { key: "breakfast", ko: "아침", latin: "MORNING", time: "08:00", dot: "#d9b878" },
  { key: "lunch", ko: "점심", latin: "NOON", time: "12:30", dot: "#9caa82" },
  { key: "dinner", ko: "저녁", latin: "EVENING", time: "18:30", dot: "#c0855f" },
];

const ALLERGENS = [
  { label: "계란", tokens: ["계란", "메추리알", "마요"] },
  { label: "우유·유제품", tokens: ["우유", "치즈", "요거트", "그래놀라", "바나나우유"] },
  { label: "밀·글루텐", tokens: ["식빵", "빵", "면", "만두", "빵가루", "핫케이크", "시리얼", "카레", "돈가스"] },
  { label: "콩", tokens: ["두부", "두유", "된장", "간장", "완두콩"] },
  { label: "생선·해산물", tokens: ["고등어", "연어", "멸치", "어묵", "참치", "새우", "미역", "꽃게", "대하", "전어", "주꾸미", "굴", "삼치", "바지락"] },
  { label: "돼지고기", tokens: ["돼지", "햄", "제육", "돈가스", "스팸", "소시지"] },
  { label: "견과", tokens: ["견과", "땅콩", "그래놀라"] },
];

const SEASONAL = {
  1:  { 채소: ["시금치", "봄동", "우엉", "연근"], 수산물: ["방어", "굴", "삼치", "홍합"],   과일: ["귤", "한라봉", "천혜향"] },
  2:  { 채소: ["냉이", "봄동", "달래", "시금치"], 수산물: ["삼치", "굴", "바지락", "홍합"], 과일: ["딸기", "귤"] },
  3:  { 채소: ["냉이", "달래", "취나물", "두릅"],  수산물: ["주꾸미", "바지락", "도다리"],   과일: ["딸기"] },
  4:  { 채소: ["참나물", "취나물", "고사리", "두릅"],수산물: ["주꾸미", "멸치", "바지락"],    과일: ["딸기", "참외"] },
  5:  { 채소: ["완두콩", "아스파라거스", "상추", "깻잎"], 수산물: ["전복", "멸치", "주꾸미"], 과일: ["딸기", "참외"] },
  6:  { 채소: ["감자", "애호박", "오이", "풋콩"],  수산물: ["꽃게", "오징어", "민어"],       과일: ["참외", "수박", "자두"] },
  7:  { 채소: ["옥수수", "가지", "오이", "깻잎"],  수산물: ["꽃게", "갈치", "오징어"],       과일: ["수박", "복숭아", "블루베리"] },
  8:  { 채소: ["가지", "깻잎", "옥수수", "풋고추"], 수산물: ["전어", "대하", "갈치"],         과일: ["포도", "복숭아", "무화과"] },
  9:  { 채소: ["고구마", "버섯", "연근", "가지"],  수산물: ["전어", "대하", "낙지"],          과일: ["포도", "배", "사과"] },
  10: { 채소: ["단호박", "고구마", "버섯", "연근"], 수산물: ["대하", "낙지", "고등어"],       과일: ["사과", "배", "감"] },
  11: { 채소: ["무", "연근", "우엉", "시금치"],    수산물: ["굴", "삼치", "고등어"],          과일: ["사과", "배", "유자"] },
  12: { 채소: ["시금치", "무", "연근", "우엉"],    수산물: ["굴", "방어", "삼치"],             과일: ["귤", "한라봉", "사과"] },
};
/* 월별 제철 카드 메타 — 분위기 문구 + 시각 테마 */
const MONTH_META = {
  1:  { tagline: "겨울 끝자락, 귤빛 온기를 담은 한 상", icon: "snow",   bg: "#e8edf3", accent: "#5d7e92" },
  2:  { tagline: "봄이 오는 길목, 딸기 향이 물드는",     icon: "snow",   bg: "#f0ece8", accent: "#9e7a5a" },
  3:  { tagline: "봄기운 솔솔, 신선한 재료가 왔어요",    icon: "leaf",   bg: "#eaf3e2", accent: "#5e8e4e" },
  4:  { tagline: "꽃피는 봄 밥상, 가볍고 산뜻하게",     icon: "leaf",   bg: "#edf5e0", accent: "#6a9050" },
  5:  { tagline: "초록 가득한 5월, 싱싱한 재료 총출동",  icon: "leaf",   bg: "#e8f2dc", accent: "#5a8a40" },
  6:  { tagline: "초여름 햇살, 달고 시원한 한 입씩",     icon: "sun",    bg: "#f8f0d8", accent: "#c4963a" },
  7:  { tagline: "한여름 제철, 시원하고 달달하게",        icon: "sun",    bg: "#f8ecd0", accent: "#c4843a" },
  8:  { tagline: "무더운 여름, 싱그러운 제철 한 상",     icon: "sun",    bg: "#f8e8c8", accent: "#c47830" },
  9:  { tagline: "결실의 계절, 가을 밥상이 풍성해요",    icon: "leaf",   bg: "#f4e8de", accent: "#a06040" },
  10: { tagline: "깊어지는 가을, 따뜻하게 채우는 식탁",  icon: "leaf",   bg: "#f2e2d8", accent: "#9e5030" },
  11: { tagline: "서늘한 바람, 따뜻한 제철 재료들",      icon: "leaf",   bg: "#eee4e0", accent: "#8a5040" },
  12: { tagline: "한 해 마지막, 진하고 따뜻한 밥상",     icon: "snow",   bg: "#e6eaee", accent: "#506a7c" },
};

/* 상비(양념)·재료 분류 + 재료 통일 */
const STAPLES = new Set(["밥", "쌀", "간장", "참기름", "소금", "설탕", "케첩", "마요", "카레", "고추장", "된장", "식용유", "빵가루", "잼", "핫케이크가루", "짜장소스", "크림소스", "토마토소스"]);
const CANON = { "다진소고기": "소고기", "잔멸치": "멸치", "닭다리살": "닭고기", "양상추": "상추", "호박": "애호박", "파": "대파" };
const canon = (x) => CANON[x] || x;
const PROTEIN_CATS = new Set(["beef", "chicken", "pork", "fish", "egg", "tofu"]);
const FRUIT_NAMES = ["사과", "바나나", "딸기", "귤", "포도", "블루베리", "배", "방울토마토", "키위", "참외", "오렌지", "수박"];
function ingCategory(name) {
  if (STAPLES.has(name)) return "상비";
  if (FRUIT_NAMES.includes(name)) return "과일";
  if (["소고기", "닭고기", "돼지고기", "햄", "스팸", "소시지"].some((m) => name.includes(m))) return "육류";
  if (["고등어", "연어", "새우", "멸치", "어묵", "참치", "미역", "김", "단무지",
       "꽃게", "대하", "전어", "주꾸미", "굴", "삼치", "바지락", "전복", "진미채", "방어", "갈치", "낙지", "홍합"].some((m) => name.includes(m))) return "수산·해조";
  if (["계란", "메추리알", "우유", "치즈", "요거트", "두유", "바나나우유"].some((m) => name.includes(m))) return "계란·유제품";
  if (["식빵", "빵", "면", "당면", "만두", "시리얼", "누룽지", "그래놀라", "모닝빵"].some((m) => name.includes(m))) return "곡물·빵";
  return "채소";
}
const CART_ORDER = ["채소", "과일", "육류", "수산·해조", "계란·유제품", "곡물·빵"];
// 특정 재료 주간 사용 빈도 상한
const ING_CAPS = { 우유: 2, 바나나우유: 2 };

const KID_MSGS = [
  "엄마가 해준 밥 먹고 오늘도 쑥쑥 클 거야!",
  "골고루 다 먹었어. 나 건강 대장이지?",
  "채소도 먹었더니 배 속이 든든해. 고마워 엄마!",
  "엄마 밥 먹으면 아픈 데가 싹 사라지는 것 같아.",
  "엄마, 세상에서 엄마가 제일 좋아. 사랑해!",
  "엄마랑 같이 먹는 밥이 제일 맛있어.",
  "엄마, 매일 맛있는 밥 차려줘서 고마워.",
  "엄마 덕분에 배부르고 행복해. 정말 고마워!",
  "엄마 손은 요리 요정 손 같아. 최고야!",
  "엄마는 우리 집 일등 셰프야. 짱!",
  "엄마 밥은 식당보다 백배 맛있어.",
  "나 오늘 당근 먹어서 토끼만큼 튼튼해졌어!",
  "밥 잘 먹고 힘 세져서 엄마 꼭 안아줄게!",
  "엄마, 다 먹었으니까 오늘도 칭찬 도장 꽝!",
  "엄마 오늘도 고생했지? 내가 안아줄게. 사랑해!",
  "엄마 품이 제일 따뜻해. 밥 먹고 안아줘잉~",
  "한 그릇 뚝딱 비웠어. 엄마 보고 있지? 헤헤.",
  "엄마가 만든 국 진짜 맛있어. 또 먹고 싶어!",
];

/* ---- 헬퍼 ---- */
const hasEgg = (it) => !!it && (it.cat === "egg" || (it.ing && it.ing.includes("계란")));
const filterPool = (pool, tokens) =>
  !tokens.length ? pool : pool.filter((it) => !tokens.some((t) => it.name.includes(t) || it.ing.some((g) => g.includes(t))));

function scoreItem(it, have, protCount, prevHave, mealHave, seasonalSet) {
  let nw = 0;
  for (const g of it.ing) {
    if (STAPLES.has(g)) continue;
    if (!have.has(canon(g))) nw++;
  }
  let consecutive = 0;
  if (prevHave) { for (const g of it.ing) { if (!STAPLES.has(g) && prevHave.has(canon(g))) consecutive++; } }
  let mealOverlap = 0;
  if (mealHave) { for (const g of it.ing) { if (!STAPLES.has(g) && mealHave.has(canon(g))) mealOverlap++; } }
  // 제철 재료 포함 메뉴 우선 선택 보너스
  let seasonBonus = 0;
  if (seasonalSet) { for (const g of it.ing) { if (seasonalSet.has(g)) { seasonBonus = -2.0; break; } } }
  let pen = 0;
  if (it.cat && PROTEIN_CATS.has(it.cat)) { const c = protCount[it.cat] || 0; if (c >= 2) pen += (c - 1) * 2; }
  for (const g of it.ing) { if (ING_CAPS[g] !== undefined && (protCount[g] || 0) >= ING_CAPS[g]) pen += 5; }
  return nw + consecutive * 2.5 + mealOverlap * 4.0 + pen + seasonBonus;
}
function register(it, have, protCount) {
  if (!it) return;
  it.ing.forEach((g) => {
    if (!STAPLES.has(g)) have.add(canon(g));
    if (ING_CAPS[g] !== undefined) protCount[g] = (protCount[g] || 0) + 1;
  });
  if (it.cat && PROTEIN_CATS.has(it.cat)) protCount[it.cat] = (protCount[it.cat] || 0) + 1;
}

/* 비용 최소화 선택 */
function pickBest(pool, seed, avoidCat, noEgg, used, have, protCount, prevHave, mealHave = null, seasonalSet = null) {
  if (!pool.length) return null;
  const n = pool.length, start = ((seed % n) + n) % n;
  let best = null, bestScore = Infinity;
  // Loop 1: avoidCat + noEgg + not-used (엄격)
  for (let k = 0; k < n; k++) {
    const it = pool[(start + k) % n];
    if (avoidCat && avoidCat.has(it.cat)) continue;
    if (noEgg && hasEgg(it)) continue;
    if (used.has(it.name)) continue;
    const sc = scoreItem(it, have, protCount, prevHave, mealHave, seasonalSet) + k * 0.001;
    if (sc < bestScore) { bestScore = sc; best = it; }
  }
  if (best) return best;
  // Loop 2: avoidCat+noEgg 완화, not-used 유지 (카테고리 소진 시)
  bestScore = Infinity;
  for (let k = 0; k < n; k++) {
    const it = pool[(start + k) % n];
    if (used.has(it.name)) continue;
    const sc = scoreItem(it, have, protCount, prevHave, mealHave, seasonalSet) + k * 0.001;
    if (sc < bestScore) { bestScore = sc; best = it; }
  }
  if (best) return best;
  // Loop 3: 풀 소진 시 최후 수단 — avoidCat+noEgg만 지키고 중복 허용
  for (let k = 0; k < n; k++) {
    const it = pool[(start + k) % n];
    if (avoidCat && avoidCat.has(it.cat)) continue;
    if (noEgg && hasEgg(it)) continue;
    return it;
  }
  return pool[start];
}

function pickAnchor(P, month) {
  const list = SEASONAL[month] ? Object.values(SEASONAL[month]).flat() : [];
  for (const ing of list) {
    const cands = [
      ...P.main.filter((d) => d.ing.includes(ing)).map((d) => ({ d, comp: "main" })),
      ...P.side.filter((d) => d.ing.includes(ing)).map((d) => ({ d, comp: "side" })),
      ...P.soup.filter((d) => d.ing.includes(ing)).map((d) => ({ d, comp: "soup" })),
    ];
    const seen = new Set(), distinct = [];
    for (const c of cands) { if (!seen.has(c.d.name)) { seen.add(c.d.name); distinct.push(c); } }
    if (distinct.length >= 2) return { ing, picks: distinct.slice(0, 2) };
  }
  return null;
}

function buildDay(di, seed, bumps, skip, P, used, pin, have, protCount, prevIng, forceAvoid, seasonalSet = null) {
  // forceAvoid는 이 날에만 적용 — 전역 used를 오염시키지 않기 위해 로컬 복사본 생성
  // 실제 선택된 항목만 전역 used에 추가해 다른 요일에 영향을 주지 않음
  const lBf   = forceAvoid ? new Set(used.bf)   : used.bf;
  const lMain = forceAvoid ? new Set(used.main) : used.main;
  const lSide = forceAvoid ? new Set(used.side) : used.side;
  const lSoup = forceAvoid ? new Set(used.soup) : used.soup;
  if (forceAvoid) {
    if (forceAvoid.bf) lBf.add(forceAvoid.bf);
    [forceAvoid.lm, forceAvoid.dm].forEach(n => n && lMain.add(n));
    [forceAvoid.ls, forceAvoid.ds].forEach(n => n && lSide.add(n));
    [forceAvoid.lp, forceAvoid.dp].forEach(n => n && lSoup.add(n));
  }

  const s = skip[di] || {};
  const pBf = prevIng?.bf || null, pL = prevIng?.lunch || null, pD = prevIng?.dinner || null;
  let egg = false, lunchMainCat = null;
  // 메인이 이미 국물 요리인지 (우동·탕·국·찌개 → 추가 국 불필요)
  const isLiq = (m) => m && (['탕','국','찌개'].some(k=>m.name.includes(k)) || (m.name.includes('우동')&&!m.name.includes('볶음')));
  // 하루에 국은 한 끼에만 — 요일 홀짝으로 점심/저녁 교대
  const soupMeal = s.lunch ? 'dinner' : (di % 2 === 0 ? 'lunch' : 'dinner');

  let breakfast = null;
  if (!s.breakfast) {
    const m = pickBest(P.bf, seed * 2 + di + (bumps.breakfast || 0), null, false, lBf, have, protCount, pBf, null, seasonalSet);
    if (m) {
      used.bf.add(m.name); lBf.add(m.name);
      register(m, have, protCount); if (hasEgg(m)) egg = true;
      breakfast = { main: m };
    } else breakfast = { empty: true };
  }

  let lunch = null;
  if (!s.lunch) {
    const m = pickBest(P.main, seed * 5 + di * 2 + (bumps.lunch || 0), null, egg, lMain, have, protCount, pL, null, seasonalSet);
    if (m) {
      used.main.add(m.name); lMain.add(m.name);
      register(m, have, protCount); lunchMainCat = m.cat; if (hasEgg(m)) egg = true;
      // 끼니 내 재료 추적 — 반찬·국에서 동일 재료 중복 방지
      const mealH = new Set(m.ing.filter(g=>!STAPLES.has(g)).map(canon));
      const sd = pickBest(P.side, seed * 7 + di + (bumps.lunch || 0), new Set([m.cat]), egg, lSide, have, protCount, pL, mealH, seasonalSet);
      if (sd) { used.side.add(sd.name); lSide.add(sd.name); register(sd, have, protCount); sd.ing.filter(g=>!STAPLES.has(g)).map(canon).forEach(g=>mealH.add(g)); }
      const sp = (soupMeal === 'lunch' && !isLiq(m))
        ? pickBest(P.soup, seed * 11 + di + (bumps.lunch || 0), new Set([m.cat]), egg, lSoup, have, protCount, pL, mealH, seasonalSet)
        : null;
      if (sp) { used.soup.add(sp.name); lSoup.add(sp.name); register(sp, have, protCount); }
      if (hasEgg(sd) || hasEgg(sp)) egg = true;
      lunch = { main: m, side: sd, soup: sp };
    } else lunch = { empty: true };
  }

  let dinner = null;
  if (!s.dinner) {
    let m, sd, sp;
    if (pin && pin.comp === "main") { m = pin.dish; register(m, have, protCount); }
    else {
      m = pickBest(P.main, seed * 13 + di * 3 + (bumps.dinner || 0), lunchMainCat ? new Set([lunchMainCat]) : null, egg, lMain, have, protCount, pD, null, seasonalSet);
      if (m) { used.main.add(m.name); lMain.add(m.name); register(m, have, protCount); }
    }
    if (m) {
      if (hasEgg(m)) egg = true;
      const mealH = new Set(m.ing.filter(g=>!STAPLES.has(g)).map(canon));
      if (pin && pin.comp === "side") { sd = pin.dish; register(sd, have, protCount); }
      else { sd = pickBest(P.side, seed * 17 + di + (bumps.dinner || 0), new Set([m.cat]), egg, lSide, have, protCount, pD, mealH, seasonalSet); if (sd) { used.side.add(sd.name); lSide.add(sd.name); register(sd, have, protCount); sd.ing.filter(g=>!STAPLES.has(g)).map(canon).forEach(g=>mealH.add(g)); } }
      if (pin && pin.comp === "soup") { sp = pin.dish; register(sp, have, protCount); }
      else {
        sp = (soupMeal === 'dinner' && !isLiq(m))
          ? pickBest(P.soup, seed * 19 + di + (bumps.dinner || 0), new Set([m.cat]), egg, lSoup, have, protCount, pD, mealH, seasonalSet)
          : null;
        if (sp) { used.soup.add(sp.name); lSoup.add(sp.name); register(sp, have, protCount); }
      }
      dinner = { main: m, side: sd, soup: sp };
    } else dinner = { empty: true };
  }
  return { day: DAYS[di], breakfast, lunch, dinner };
}

function buildWeek(seed, skip, tokens, month) {
  const P = {
    bf: filterPool(BF_MAINS, tokens),
    main: filterPool(MAINS, tokens), side: filterPool(SIDES, tokens), soup: filterPool(SOUPS, tokens),
  };
  const anchor = pickAnchor(P, month);
  const pins = new Array(7).fill(null);
  if (anchor) {
    const targets = [];
    for (let di = 0; di < 7; di++) { if (skip[di] && skip[di].dinner) continue; targets.push(di); }
    anchor.picks.forEach((p, idx) => { const di = targets[idx]; if (di != null) pins[di] = { comp: p.comp, dish: p.d }; });
  }
  const used = { bf: new Set(), main: new Set(), side: new Set(), soup: new Set() };
  const have = new Set(); const protCount = {};
  if (anchor) anchor.picks.forEach((p) => {
    (p.comp === "main" ? used.main : p.comp === "side" ? used.side : used.soup).add(p.d.name);
    p.d.ing.forEach((g) => { if (!STAPLES.has(g)) have.add(canon(g)); });
  });
  // 이번 달 제철 재료 세트 — 점수 보너스 적용에 사용
  const seasonalSet = new Set(Object.values(SEASONAL[month] || {}).flat());
  const res = new Array(7);
  const extractIng = (d, slot) => {
    const m = d?.[slot]; if (!m || m.empty) return new Set();
    const ings = slot === "breakfast" ? [...(m.main?.ing || [])]
      : [...(m.main?.ing || []), ...(m.side?.ing || []), ...(m.soup?.ing || [])];
    return new Set(ings.filter(g => !STAPLES.has(g)).map(canon));
  };
  let prevIng = null;
  for (let di = 0; di < 7; di++) {
    res[di] = buildDay(di, seed, {breakfast:0,lunch:0,dinner:0}, skip, P, used, pins[di], have, protCount, prevIng, null, seasonalSet);
    prevIng = { bf: extractIng(res[di], "breakfast"), lunch: extractIng(res[di], "lunch"), dinner: extractIng(res[di], "dinner") };
  }
  return {
    week: res, season: SEASONAL[month] || [], month,
    anchor: anchor ? { ing: anchor.ing, dishes: anchor.picks.map((p) => p.d.name) } : null,
  };
}

const mealIngredients = (key, day) => {
  const m = day[key]; if (!m || m.empty) return [];
  const raw = key === "breakfast"
    ? [...(m.main?.ing || [])]
    : [...(m.main?.ing || []), ...(m.side?.ing || []), ...(m.soup?.ing || [])];
  return [...new Set(raw.map(canon))];
};
function mealKey(key, day) {
  const m = day[key]; if (!m || m.empty) return null;
  return key === "breakfast"
    ? `b|${m.main?.name}`
    : `${key}|${m.main?.name}|${m.side?.name || ""}|${m.soup?.name || ""}`;
}
const daySig = (d) => "w|" + SLOTS.map((s) => mealKey(s.key, d) || "").join("||");

/* ---- 오늘 메뉴 직접 편집 패널 ---- */
function TodayEditPanel({ day, skip, tokens, onSave, onClose }) {
  const pools = {
    bf:   filterPool(BF_MAINS, tokens),
    main: filterPool(MAINS, tokens),
    side: filterPool(SIDES, tokens),
    soup: filterPool(SOUPS, tokens),
  };
  const [draft, setDraft] = useState({
    breakfast: { main: day.breakfast?.main || null },
    lunch:  { main: day.lunch?.main || null,  side: day.lunch?.side || null,  soup: day.lunch?.soup || null },
    dinner: { main: day.dinner?.main || null, side: day.dinner?.side || null, soup: day.dinner?.soup || null },
  });
  const [open, setOpen] = useState(null);
  const toggle = (id) => setOpen(o => (o === id ? null : id));
  const pick = (meal, comp, item) => { setDraft(d => ({ ...d, [meal]: { ...d[meal], [comp]: item } })); setOpen(null); };

  const slots = [
    { id: 'bf',  Icon: Sun,  label: '아침',     pool: pools.bf,   meal: 'breakfast', comp: 'main' },
    ...(!skip.lunch ? [
      { id: 'lm', Icon: null, label: '점심 메인', pool: pools.main, meal: 'lunch',  comp: 'main' },
      { id: 'ls', Icon: null, label: '점심 반찬', pool: pools.side, meal: 'lunch',  comp: 'side' },
      { id: 'lp', Icon: null, label: '점심 국',   pool: pools.soup, meal: 'lunch',  comp: 'soup' },
    ] : []),
    { id: 'dm', Icon: Moon, label: '저녁 메인', pool: pools.main, meal: 'dinner', comp: 'main' },
    { id: 'ds', Icon: null, label: '저녁 반찬', pool: pools.side, meal: 'dinner', comp: 'side' },
    { id: 'dp', Icon: null, label: '저녁 국',   pool: pools.soup, meal: 'dinner', comp: 'soup' },
  ];

  const handleSave = () => {
    onSave({
      day: day.day,
      breakfast: draft.breakfast.main ? { main: draft.breakfast.main } : (day.breakfast || { empty: true }),
      lunch:  draft.lunch.main  ? draft.lunch  : (day.lunch  || { empty: true }),
      dinner: draft.dinner.main ? draft.dinner : (day.dinner || { empty: true }),
    });
    onClose();
  };

  return (
    <div className="tedit">
      <div className="tedit-hd">
        <button className="icon-btn sm" onClick={onClose}><X size={17} /></button>
        <span className="tedit-title">오늘 메뉴 편집</span>
        <button className="tedit-save" onClick={handleSave}>완료</button>
      </div>
      <div className="tedit-body">
        {slots.map(sl => {
          const cur = draft[sl.meal]?.[sl.comp];
          return (
            <div key={sl.id} className="tedit-slot">
              <button className="tedit-row" onClick={() => toggle(sl.id)}>
                <span className="tedit-lbl">
                  {sl.Icon && <sl.Icon size={13} strokeWidth={1.8} style={{marginRight:5, verticalAlign:'middle', opacity:.7}} />}
                  {sl.label}
                </span>
                <span className="tedit-cur">{cur?.name || '—'}</span>
                <ChevronDown size={13} className="tedit-caret" style={{ transform: open === sl.id ? 'rotate(180deg)' : 'none' }} />
              </button>
              {open === sl.id && (
                <div className="tedit-list">
                  {sl.pool.map(it => (
                    <button key={it.name} className={`tedit-item${cur?.name === it.name ? ' sel' : ''}`}
                      onClick={() => pick(sl.meal, sl.comp, it)}>
                      {cur?.name === it.name && <Check size={11} style={{marginRight:5, flexShrink:0}} />}
                      {it.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ */
export default function App() {
  const [tab, setTab] = useState("week");
  const [panel, setPanel] = useState(null);
  const [weekSeed, setWeekSeed] = useState(3);
  // 요일별 독립 바꾸기 결과 저장 (다른 요일엔 절대 영향 없음)
  const [weekOverrides, setWeekOverrides] = useState(() => new Array(7).fill(null));
  const [rollCounts, setRollCounts] = useState(() => new Array(7).fill(0));
  // 바꾸기 이력 — useRef로 동기 업데이트 (state batching 문제 없이 즉시 반영)
  const mkHist = () => new Array(7).fill(null).map(() => ({ bf: new Set(), main: new Set(), side: new Set(), soup: new Set() }));
  const histRef = useRef(mkHist());
  const [cart, setCart] = useState([]);
  const [addedKeys, setAddedKeys] = useState(() => new Set());
  const [memoList, setMemoList] = useState([]);
  const [skip, setSkip] = useState(() => DAYS.map((_, i) => ({ breakfast: false, lunch: i < 5, dinner: false })));
  const [allergens, setAllergens] = useState([]);
  const [customAvoid, setCustomAvoid] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof window !== "undefined" && storage) {
          const r = await storage.get("nyam:state");
          if (alive && r && r.value) {
            const d = JSON.parse(r.value);
            if (Array.isArray(d.cart)) setCart(d.cart);
            if (Array.isArray(d.added)) setAddedKeys(new Set(d.added));
            if (Array.isArray(d.memoList)) setMemoList(d.memoList);
            else if (typeof d.memo === "string" && d.memo.trim()) setMemoList([{ text: d.memo.trim(), done: false }]);
            if (Array.isArray(d.skip)) setSkip(d.skip);
            if (Array.isArray(d.allergens)) setAllergens(d.allergens);
            if (Array.isArray(d.customAvoid)) setCustomAvoid(d.customAvoid);
            if (typeof d.weekSeed === "number") setWeekSeed(d.weekSeed);
          }
        }
      } catch (e) {}
      if (alive) setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        if (typeof window !== "undefined" && storage) {
          await storage.set("nyam:state", JSON.stringify({
            cart, added: [...addedKeys], memoList, skip, allergens, customAvoid, weekSeed,
          }));
        }
      } catch (e) {}
    }, 500);
    return () => clearTimeout(t);
  }, [loaded, cart, addedKeys, memoList, skip, allergens, customAvoid, weekSeed]);

  const tokens = useMemo(() => {
    const t = [];
    allergens.forEach((l) => { const a = ALLERGENS.find((x) => x.label === l); if (a) t.push(...a.tokens); });
    customAvoid.forEach((c) => t.push(c));
    return t;
  }, [allergens, customAvoid]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const todayDow = (now.getDay() + 6) % 7;
  const dateStr = `${month}월 ${now.getDate()}일 ${DAYS[todayDow]}요일`;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

  // 기본 주간 식단 (완전 결정론적 — 바꾸기 버튼과 무관)
  const baseInfo = useMemo(() => buildWeek(weekSeed, skip, tokens, month),
    [weekSeed, skip, tokens, month]);

  // 표시 식단 = 기본 + 개별 바꾸기 결과
  const displayedWeek = useMemo(
    () => baseInfo.week.map((d, i) => weekOverrides[i] || d),
    [baseInfo, weekOverrides]
  );
  const todayObj = displayedWeek[todayDow];
  const weekInfo = useMemo(() => ({ ...baseInfo, week: displayedWeek }), [baseInfo, displayedWeek]);

  // 다른 요일에서 used/have/protCount 수집 (독립 빌드 컨텍스트)
  const collectOthers = (excludeDi) => {
    const used = { bf: new Set(), main: new Set(), side: new Set(), soup: new Set() };
    const have = new Set(); const protCount = {};
    for (let d = 0; d < 7; d++) {
      if (d === excludeDi) continue;
      const day = displayedWeek[d]; if (!day) continue;
      if (day.breakfast?.main) used.bf.add(day.breakfast.main.name);
      if (day.lunch?.main) used.main.add(day.lunch.main.name);
      if (day.lunch?.side) used.side.add(day.lunch.side.name);
      if (day.lunch?.soup) used.soup.add(day.lunch.soup.name);
      if (day.dinner?.main) used.main.add(day.dinner.main.name);
      if (day.dinner?.side) used.side.add(day.dinner.side.name);
      if (day.dinner?.soup) used.soup.add(day.dinner.soup.name);
      [day.breakfast?.main, day.lunch?.main, day.lunch?.side, day.lunch?.soup,
       day.dinner?.main, day.dinner?.side, day.dinner?.soup]
        .filter(Boolean).forEach(it => register(it, have, protCount));
    }
    return { used, have, protCount };
  };

  const getP = () => ({
    bf: filterPool(BF_MAINS, tokens), main: filterPool(MAINS, tokens),
    side: filterPool(SIDES, tokens), soup: filterPool(SOUPS, tokens),
  });

  // 오늘 탭: 끼니별 바꾸기 — ref 이력으로 반드시 새 메뉴, A→B→A 방지
  const cycle = (key) => {
    const di = todayDow;
    const cur = displayedWeek[di]; if (!cur) return;
    const { used: uO, have, protCount } = collectOthers(di);
    const P = getP();
    const rc = rollCounts[di] + 1;
    const rs = weekSeed * 997 + di * 101 + rc * 83;
    const s = skip[di] || {};
    const eggBf = hasEgg(cur.breakfast?.main);
    const H = histRef.current[di];
    let newDay = cur;
    const isLiq = (m) => m && (['탕','국','찌개'].some(k=>m.name.includes(k)) || (m.name.includes('우동')&&!m.name.includes('볶음')));
    const soupMeal = s.lunch ? 'dinner' : (di % 2 === 0 ? 'lunch' : 'dinner');

    const addHist = (set, name) => { if (name) set.add(name); };
    const resetIfFull = (histSet, pool, baseExcl) => {
      const avail = pool.filter(it => !baseExcl.has(it.name)).length;
      if (histSet.size >= Math.max(avail - 1, 1)) histSet.clear();
    };

    if (key === "breakfast") {
      resetIfFull(H.bf, P.bf, uO.bf);
      const excl = new Set([...uO.bf, ...H.bf, cur.breakfast?.main?.name].filter(Boolean));
      const m = pickBest(P.bf, rs, null, false, excl, have, protCount, null);
      if (m) { addHist(H.bf, cur.breakfast?.main?.name); newDay = { ...cur, breakfast: { main: m } }; }

    } else if (key === "lunch" && !s.lunch) {
      resetIfFull(H.main, P.main, uO.main);
      const exclM = new Set([...uO.main, ...H.main, cur.lunch?.main?.name, cur.dinner?.main?.name].filter(Boolean));
      const exclS = new Set([...uO.side, ...H.side, cur.lunch?.side?.name, cur.dinner?.side?.name].filter(Boolean));
      const exclP = new Set([...uO.soup, ...H.soup, cur.lunch?.soup?.name, cur.dinner?.soup?.name].filter(Boolean));
      const m = pickBest(P.main, rs, null, eggBf, exclM, have, protCount, null);
      if (m) {
        const egg2 = eggBf || hasEgg(m);
        addHist(H.main, cur.lunch?.main?.name); addHist(H.side, cur.lunch?.side?.name); addHist(H.soup, cur.lunch?.soup?.name);
        const sd = pickBest(P.side, rs * 3 + 1, new Set([m.cat]), egg2, exclS, have, protCount, null);
        const sp = (soupMeal === 'lunch' && !isLiq(m))
          ? pickBest(P.soup, rs * 3 + 2, new Set([m.cat]), egg2, exclP, have, protCount, null) : null;
        newDay = { ...cur, lunch: { main: m, side: sd, soup: sp } };
      }

    } else if (key === "dinner" && !s.dinner) {
      resetIfFull(H.main, P.main, uO.main);
      const lmCat = cur.lunch?.main?.cat;
      const eggAll = eggBf || hasEgg(cur.lunch?.main);
      const exclM = new Set([...uO.main, ...H.main, cur.lunch?.main?.name, cur.dinner?.main?.name].filter(Boolean));
      const exclS = new Set([...uO.side, ...H.side, cur.lunch?.side?.name, cur.dinner?.side?.name].filter(Boolean));
      const exclP = new Set([...uO.soup, ...H.soup, cur.lunch?.soup?.name, cur.dinner?.soup?.name].filter(Boolean));
      const m = pickBest(P.main, rs, lmCat ? new Set([lmCat]) : null, eggAll, exclM, have, protCount, null);
      if (m) {
        const egg2 = eggAll || hasEgg(m);
        addHist(H.main, cur.dinner?.main?.name); addHist(H.side, cur.dinner?.side?.name); addHist(H.soup, cur.dinner?.soup?.name);
        const sd = pickBest(P.side, rs * 3 + 1, new Set([m.cat]), egg2, exclS, have, protCount, null);
        const sp = (soupMeal === 'dinner' && !isLiq(m))
          ? pickBest(P.soup, rs * 3 + 2, new Set([m.cat]), egg2, exclP, have, protCount, null) : null;
        newDay = { ...cur, dinner: { main: m, side: sd, soup: sp } };
      }
    }
    setRollCounts(prev => prev.map((c, i) => i === di ? c + 1 : c));
    setWeekOverrides(prev => prev.map((o, i) => i === di ? newDay : o));
  };

  // 한 주 탭: 요일별 전체 바꾸기 — ref 이력 누적, 다른 요일 불변
  const cycleDayAll = (di) => {
    const cur = displayedWeek[di]; if (!cur) return;
    const H = histRef.current[di];
    const { used, have, protCount } = collectOthers(di);
    // 이미 본 메뉴 + 현재 메뉴 모두 used에 추가 (ref 이력 활용)
    [...H.bf, cur.breakfast?.main?.name].filter(Boolean).forEach(n => used.bf.add(n));
    [...H.main, cur.lunch?.main?.name, cur.dinner?.main?.name].filter(Boolean).forEach(n => used.main.add(n));
    [...H.side, cur.lunch?.side?.name, cur.dinner?.side?.name].filter(Boolean).forEach(n => used.side.add(n));
    [...H.soup, cur.lunch?.soup?.name, cur.dinner?.soup?.name].filter(Boolean).forEach(n => used.soup.add(n));
    // ref 이력 동기 업데이트
    if (cur.breakfast?.main?.name) H.bf.add(cur.breakfast.main.name);
    [cur.lunch?.main?.name, cur.dinner?.main?.name].filter(Boolean).forEach(n => H.main.add(n));
    [cur.lunch?.side?.name, cur.dinner?.side?.name].filter(Boolean).forEach(n => H.side.add(n));
    [cur.lunch?.soup?.name, cur.dinner?.soup?.name].filter(Boolean).forEach(n => H.soup.add(n));
    const P = getP();
    const rc = rollCounts[di] + 1;
    const rs = weekSeed * 997 + di * 101 + rc * 83;
    const prevDay = di > 0 ? displayedWeek[di - 1] : null;
    const prevIng = prevDay ? {
      bf: new Set([...(prevDay.breakfast?.main?.ing||[])].filter(g=>!STAPLES.has(g)).map(canon)),
      lunch: new Set([...(prevDay.lunch?.main?.ing||[]),...(prevDay.lunch?.side?.ing||[]),...(prevDay.lunch?.soup?.ing||[])].filter(g=>!STAPLES.has(g)).map(canon)),
      dinner: new Set([...(prevDay.dinner?.main?.ing||[]),...(prevDay.dinner?.side?.ing||[]),...(prevDay.dinner?.soup?.ing||[])].filter(g=>!STAPLES.has(g)).map(canon)),
    } : null;
    const seasonalSet = new Set(Object.values(SEASONAL[month] || {}).flat());
    const newDay = buildDay(di, rs, { breakfast:0, lunch:0, dinner:0 }, skip, P, used, null, have, protCount, prevIng, null, seasonalSet);
    setRollCounts(prev => prev.map((c, i) => i === di ? c + 1 : c));
    setWeekOverrides(prev => prev.map((o, i) => i === di ? newDay : o));
  };

  const addToCart = (ings, sig) => {
    setCart((prev) => {
      const names = new Set(prev.map((x) => x.name)); const next = [...prev];
      ings.forEach((raw) => { const n = canon(raw); if (!names.has(n)) { names.add(n); next.push({ name: n, done: false }); } });
      return next;
    });
    if (sig) setAddedKeys((prev) => { const n = new Set(prev); n.add(sig); return n; });
  };
  const clearCart = () => { setCart([]); setAddedKeys(new Set()); };
  const isAdded = (sig) => !!sig && addedKeys.has(sig);
  const toggleSkip = (di, key) => setSkip((prev) => prev.map((d, i) => (i === di ? { ...d, [key]: !d[key] } : d)));
  const toggleAllergen = (l) => setAllergens((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));
  const addAvoid = (v) => { const t = v.trim(); if (t && !customAvoid.includes(t)) setCustomAvoid((p) => [...p, t]); };
  const removeAvoid = (v) => setCustomAvoid((p) => p.filter((x) => x !== v));
  const [editToday, setEditToday] = useState(false);
  const saveEditedDay = (newDay) => setWeekOverrides(prev => prev.map((o, i) => i === todayDow ? newDay : o));

  return (
    <div className="muji">
      <style>{CSS}</style>
      <div className="app">
        <header className="hd">
          <div>
            <div className="mono brand">아이 식단 도우미</div>
            <h1 className="title">냠냠뚝딱</h1>
            <div className="mono date">{dateStr}</div>
          </div>
          <div className="actions">
            <button className="icon-btn" onClick={() => setPanel("cart")} aria-label="장보기 목록">
              <ShoppingBasket size={19} />{cart.length > 0 && <span className="badge">{cart.length}</span>}
            </button>
            <button className="icon-btn" onClick={() => setPanel("settings")} aria-label="설정"><Settings size={19} /></button>
          </div>
        </header>

        <nav className="tabs">
          <button className={`tab ${tab === "today" ? "on" : ""}`} onClick={() => setTab("today")}><Sun size={15} /> 오늘</button>
          <button className={`tab ${tab === "week" ? "on" : ""}`} onClick={() => setTab("week")}><CalendarDays size={15} /> 한 주</button>
          <button className={`tab ${tab === "fridge" ? "on" : ""}`} onClick={() => setTab("fridge")}><Refrigerator size={15} /> 냉털</button>
        </nav>

        <main className="main" key={tab}>
          {tab === "today" && <Today day={todayObj} cycle={cycle} addToCart={addToCart} isAdded={isAdded}
            msg={KID_MSGS[dayOfYear % KID_MSGS.length]} memoList={memoList} setMemoList={setMemoList} />}
          {tab === "week" && <Week info={weekInfo} todayDow={todayDow} addToCart={addToCart} isAdded={isAdded} cycleDayAll={cycleDayAll}
            regen={() => { setWeekSeed((s) => s + 1); setWeekOverrides(new Array(7).fill(null)); setRollCounts(new Array(7).fill(0)); histRef.current = mkHist(); }} />}
          {tab === "fridge" && <Fridge addToCart={addToCart} />}
        </main>

        <footer className="ft mono">소박하게 차린 우리 아이 한 끼 · 자동 저장</footer>

        {tab === "today" && (
          <button className="edit-fab" onClick={() => setEditToday(true)}>
            <Edit2 size={14} /><span>직접 편집</span>
          </button>
        )}
      </div>

      {panel === "cart" && <Overlay onClose={() => setPanel(null)}><CartNote cart={cart} setCart={setCart} onClear={clearCart} /></Overlay>}
      {panel === "settings" && <Overlay onClose={() => setPanel(null)}>
        <SettingsPanel skip={skip} toggle={toggleSkip} allergens={allergens} toggleAllergen={toggleAllergen}
          customAvoid={customAvoid} addAvoid={addAvoid} removeAvoid={removeAvoid} />
      </Overlay>}
      {editToday && <Overlay onClose={() => setEditToday(false)}>
        <TodayEditPanel day={todayObj} skip={skip[todayDow] || {}} tokens={tokens}
          onSave={saveEditedDay} onClose={() => setEditToday(false)} />
      </Overlay>}
    </div>
  );
}

/* --------------------------- 조각들 --------------------------- */
/* ---- 레시피 시트 (Claude API) ---- */
function RecipeSheet({ name, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            system: "어린이 요리 전문가입니다. 요청 음식의 간단한 레시피를 JSON으로만 답하세요. 코드블록 없이 JSON만 출력:\n{\"time\":\"조리시간\",\"ingredients\":[\"재료명 분량\"],\"steps\":[\"단계설명\"],\"tip\":\"팁\"}",
            messages: [{ role: "user", content: `어린이용 "${name}" 레시피 (2인분)` }],
          }),
        });
        if (!alive) return;
        const d = await res.json();
        if (d.code === "NO_API_KEY") { if (alive) setErr("no_key"); return; }
        const text = (d.content || []).map(b => b.text || "").join("");
        const clean = text.replace(/```[\w]*\n?/g, "").trim();
        if (alive) setData(JSON.parse(clean));
      } catch (e) { if (alive) setErr("err"); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [name]);

  return (
    <div className="recipe-sheet">
      <div className="recipe-hd">
        <div>
          <div className="recipe-dish">{name}</div>
          {data && <div className="recipe-time">⏱ {data.time}</div>}
        </div>
        <button className="icon-btn sm" onClick={onClose}><X size={17} /></button>
      </div>
      {loading && <div className="recipe-loading"><Loader2 size={20} className="spin" /><span>레시피 불러오는 중…</span></div>}
      {err === "no_key" && (
        <div className="recipe-nokey">
          <span>🔑</span>
          <p>레시피 기능을 사용하려면<br/>Vercel 환경변수에<br/><b>ANTHROPIC_API_KEY</b>를 설정하세요</p>
        </div>
      )}
      {err && err !== "no_key" && <div className="recipe-err">레시피를 불러오지 못했어요 😢</div>}
      {data && (
        <div className="recipe-body">
          <section className="recipe-sec">
            <h4 className="recipe-sec-ttl">재료</h4>
            <div className="recipe-ings">
              {(data.ingredients || []).map((ing, i) => <span key={i} className="recipe-ing-chip">{ing}</span>)}
            </div>
          </section>
          <section className="recipe-sec">
            <h4 className="recipe-sec-ttl">만드는 법</h4>
            <ol className="recipe-steps">
              {(data.steps || []).map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </section>
          {data.tip && <div className="recipe-tip">💡 {data.tip}</div>}
        </div>
      )}
    </div>
  );
}

function FoodLine({ item, label, onRecipe }) {
  if (!item) return null;
  const Icon = item.icon;
  return (
    <div className="food-line">
      <span className="food-ic"><Icon size={17} strokeWidth={1.7} /></span>
      {label && <span className="food-label">{label}</span>}
      <span className="food-name">{item.name}</span>
      {onRecipe && <button className="recipe-btn" onClick={onRecipe} title="레시피"><ChefHat size={13} /></button>}
    </div>
  );
}
function SkippedCard({ slot }) {
  return (
    <div className="card skipped">
      <span className="dot" style={{ background: slot.dot, opacity: .4 }} />
      <span className="slot-ko">{slot.ko}</span>
      <span className="skip-note">{slot.key === "lunch" ? "유치원 · 외식" : "생략"}</span>
    </div>
  );
}

/* ----------------------------- 오늘 ----------------------------- */
function MemoList({ items, setItems }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (!t) return; setItems((p) => [...p, { text: t, done: false }]); setV(""); };
  const toggle = (i) => setItems((p) => p.map((x, k) => (k === i ? { ...x, done: !x.done } : x)));
  const del = (i) => setItems((p) => p.filter((_, k) => k !== i));
  return (
    <div className="memo-list-wrap">
      <div className="memo-add">
        <input className="memo-add-input" value={v} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="할 일 추가" />
        <button className="memo-add-btn" onClick={add} aria-label="추가"><Plus size={14} /></button>
      </div>
      <ul className="memo-list">
        {items.map((it, i) => (
          <li key={i} className={it.done ? "done" : ""}>
            <button className="tick sm" onClick={() => toggle(i)}>{it.done && <Check size={11} />}</button>
            <span className="memo-text" onClick={() => toggle(i)}>{it.text}</span>
            <button className="memo-del" onClick={() => del(i)} aria-label="삭제"><X size={12} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Today({ day, cycle, addToCart, isAdded, msg, memoList, setMemoList }) {
  const [recipe, setRecipe] = useState(null); // name of dish to show recipe for
  return (
    <div className="stack">
      {SLOTS.map((s, i) => {
        const meal = day[s.key];
        if (!meal) return <SkippedCard key={s.key} slot={s} />;
        if (meal.empty) return <div className="card empty" key={s.key}><span className="slot-ko">{s.ko}</span><span className="skip-note">재료 조건에 맞는 메뉴가 없어요</span></div>;
        const sig = mealKey(s.key, day), done = isAdded(sig);
        return (
          <article className="card meal" key={s.key} style={{ animationDelay: `${i * 70}ms` }}>
            <div className="meal-top">
              <div className="meal-when">
                <span className="dot" style={{ background: s.dot }} />
                <span className="mono slot-latin">{s.latin}</span>
                <span className="slot-ko">{s.ko}</span>
                <span className="mono slot-time">{s.time}</span>
              </div>
              <div className="meal-btns">
                <button className="chg" onClick={() => cycle(s.key)}><RefreshCw size={13} /> 바꾸기</button>
                <button className={`cart-add ${done ? "ok" : ""}`} onClick={() => addToCart(mealIngredients(s.key, day), sig)}>
                  {done ? <><Check size={13} /> 담음</> : <><Plus size={13} /> 담기</>}
                </button>
              </div>
            </div>
            {s.key === "breakfast" ? (
              <div className="meal-body" key={meal.main?.name}>
                {meal.main?.parts?.map((p, idx) => (
                  <FoodLine key={idx} item={p} label={p.label}
                    onRecipe={idx === 0 ? () => setRecipe(meal.main.name) : null} />
                ))}
              </div>
            ) : (
              <div className="meal-body" key={(meal.main?.name) + (meal.side?.name) + (meal.soup?.name)}>
                <FoodLine item={meal.main} label="메인" onRecipe={meal.main ? () => setRecipe(meal.main.name) : null} />
                <FoodLine item={meal.side} label="반찬" />
                <FoodLine item={meal.soup} label="국" />
              </div>
            )}
          </article>
        );
      })}

      <div className="memo-row">
        <div className="memo-pane free">
          <span className="magnet free-mag" />
          <span className="memo-label">엄마 메모</span>
          <MemoList items={memoList} setItems={setMemoList} />
        </div>
        <div className="memo-pane kid">
          <span className="magnet kid-mag" />
          <span className="memo-label kid">아이의 한마디</span>
          <p className="kid-msg">{msg}</p>
          <span className="kid-sign">— 우리 아이가</span>
        </div>
      </div>

      {recipe && (
        <Overlay onClose={() => setRecipe(null)}>
          <RecipeSheet name={recipe} onClose={() => setRecipe(null)} />
        </Overlay>
      )}
    </div>
  );
}

/* ----------------------------- 한 주 ----------------------------- */
function Week({ info, todayDow, regen, addToCart, isAdded, cycleDayAll }) {
  const { week, season, month, anchor } = info;
  const [openSeason, setOpenSeason] = useState(false);
  const meta = MONTH_META[month] || MONTH_META[6];
  const SeasonIcon = meta.icon === "sun" ? Sun : meta.icon === "snow" ? Snowflake : Leaf;
  return (
    <div className="stack">
      <div className="season-wrap">
        <button className="season-toggle" onClick={() => setOpenSeason((v) => !v)}
          style={{ color: meta.accent, borderColor: meta.accent + "55", background: meta.bg }}>
          <SeasonIcon size={13} />
          <span>{month}월 제철 식재료</span>
          <ChevronDown size={13} className="season-caret" style={{ transform: openSeason ? "rotate(180deg)" : "none" }} />
        </button>
        {openSeason && (          <div className="season-card" style={{ background: meta.bg, borderColor: meta.accent + "44" }}>
            <div className="season-cats">
              {Object.entries(SEASONAL[month] || {}).map(([cat, items]) => (
                <div className="season-cat-row" key={cat}>
                  <span className="season-cat-label" style={{ color: meta.accent }}>{cat}</span>
                  <div className="season-chips">
                    {items.map((s) => (
                      <span className="season-chip" key={s} style={{ background: meta.accent + "18", color: meta.accent, border: `1px solid ${meta.accent}44` }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="week-bar">
        <span className="mono small-label">이번 주 식단표</span>
        <button className="chg" onClick={regen}><RefreshCw size={13} /> 새로 짜기</button>
      </div>
      {week.map((d, i) => {
        const sig = daySig(d), done = isAdded(sig);
        const dayIngs = SLOTS.flatMap((s) => mealIngredients(s.key, d));
        return (
          <article className={`card day ${i === todayDow ? "is-today" : ""}`} key={i} style={{ animationDelay: `${i * 45}ms` }}>
            <div className="day-head">
              <div className="day-head-l">
                <span className="day-name">{d.day}</span>
                {i === todayDow && <span className="mono today-tag">오늘</span>}
              </div>
              <div className="day-head-r">
                {dayIngs.length > 0 && (
                  <button className={`cart-add ${done ? "ok" : ""}`} onClick={() => addToCart(dayIngs, sig)}>
                    {done ? <><Check size={12} /> 담음</> : <><Plus size={12} /> 담기</>}
                  </button>
                )}
                <button className="day-reroll" onClick={() => cycleDayAll(i)} title="이 날 메뉴 다시 짜기">
                  <RefreshCw size={11} />
                </button>
              </div>
            </div>
            <div className="day-meals">
              {SLOTS.map((s) => {
                const meal = d[s.key];
                return (
                  <div className="day-row" key={s.key}>
                    <span className="dot sm" style={{ background: s.dot, opacity: meal && !meal.empty ? 1 : .35 }} />
                    <span className="day-ko">{s.ko}</span>
                    {meal && !meal.empty ? (
                      <span className="day-dish">
                        {s.key === "breakfast"
                          ? `${meal.main?.name}`
                          : `${meal.main?.name}${meal.side ? " · " + meal.side.name : ""}${meal.soup ? " · " + meal.soup.name : ""}`}
                      </span>
                    ) : (
                      <span className="day-skip">{!meal ? (s.key === "lunch" ? "유치원·외식" : "생략") : "메뉴 없음"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------------------------- 냉털모드 ---------------------------- */
const PRESET = ["계란", "밥", "두부", "김치", "감자", "당근", "양파", "애호박", "소고기", "닭고기", "어묵", "치즈"];
function Fridge({ addToCart }) {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const add = (raw) => { const v = raw.trim().replace(/,$/, ""); if (!v) return; if (!items.includes(v)) setItems((p) => [...p, v]); setInput(""); };
  const remove = (v) => setItems((p) => p.filter((x) => x !== v));
  const onKey = (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } };

  async function generate() {
    if (items.length === 0) return;
    setLoading(true); setError(""); setResult(null); setAdded(false);
    const prompt = `너는 아이를 위한 식단을 짜는 따뜻하고 다정한 영양사야.
부모가 지금 냉장고에 있는 재료를 알려줬어: ${items.join(", ")}
이 재료를 최대한 활용해서 아이가 잘 먹을 한 끼를 추천해줘. 간은 세게 하지 말고, 탄수화물·단백질·채소가 어우러지게.
아래 JSON 형식으로만 답해. 마크다운/설명/코드블록 없이 순수 JSON만:
{"dish":"메뉴 이름","time":"예상 조리시간","description":"한 줄 설명, 아이에게 왜 좋은지 따뜻하게","uses":["실제로 쓰는 보유 재료들"],"extra":["추가로 필요한 흔한 재료, 없으면 빈 배열"],"steps":["1단계","2단계","3단계","4단계"],"tip":"아이가 더 잘 먹게 하는 팁 한 가지"}`;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (data.code === "NO_API_KEY") { setError("no_key"); return; }
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch (e) { setError("메뉴를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."); }
    finally { setLoading(false); }
  }

  return (
    <div className="stack">
      <article className="card intro">
        <span className="mono small-label">냉장고 털기</span>
        <p className="intro-text">남은 재료를 적어주세요. 그 재료로 만들 한 끼를 골라 드릴게요.</p>
        <div className="input-wrap">
          <input className="ing-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} placeholder="재료 입력 후 Enter" />
          <button className="add-btn" onClick={() => add(input)} aria-label="추가"><Plus size={16} /></button>
        </div>
        {items.length > 0 && (<div className="ing-list">{items.map((v) => (<span className="ing-chip" key={v}>{v}<button onClick={() => remove(v)} aria-label="삭제"><X size={12} /></button></span>))}</div>)}
        <div className="preset">
          <span className="mono small-label dim">자주 쓰는 재료</span>
          <div className="preset-row">{PRESET.filter((p) => !items.includes(p)).map((p) => (<button className="preset-chip" key={p} onClick={() => add(p)}>+ {p}</button>))}</div>
        </div>
        <button className="cook-btn" disabled={items.length === 0 || loading} onClick={() => generate()}>
          {loading ? (<><Loader2 size={16} className="spin" /> 메뉴 고르는 중…</>) : (<>이 재료로 메뉴 추천받기 <ChevronRight size={16} /></>)}
        </button>
      </article>
      {error === "no_key" ? (
        <article className="card err" style={{textAlign:"center", lineHeight:1.8}}>
          <p style={{fontSize:22, marginBottom:6}}>🔑</p>
          <p style={{fontWeight:600, marginBottom:4}}>냉털 기능을 사용하려면 API 키가 필요해요</p>
          <p style={{fontSize:12.5, color:"#888"}}>Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</p>
          <p style={{fontSize:12.5, color:"#888"}}>ANTHROPIC_API_KEY 추가 후 재배포해 주세요</p>
        </article>
      ) : error ? (
        <div className="card err">{error}</div>
      ) : null}
      {result && (
        <article className="card result" key={result.dish}>
          <div className="result-nav">
            <span className="mono small-label">{idx + 1} / {results.length} 추천</span>
            <button className="next-btn" onClick={next}>{idx < results.length - 1 ? "다음 메뉴 ›" : "다른 메뉴 추천 ›"}</button>
          </div>
          <div className="result-head"><div className="dish">{result.dish}</div>{result.time && <span className="mono time-tag">{result.time}</span>}</div>
          {result.description && <p className="note">{result.description}</p>}
          {Array.isArray(result.uses) && result.uses.length > 0 && (<div className="rsec"><span className="mono small-label">있는 재료로</span><div className="ing-list">{result.uses.map((u) => <span className="chip" key={u}>{u}</span>)}</div></div>)}
          {Array.isArray(result.extra) && result.extra.length > 0 && (<div className="rsec"><span className="mono small-label dim">추가로 있으면 좋아요</span><div className="ing-list">{result.extra.map((u) => <span className="chip ghost" key={u}>{u}</span>)}</div></div>)}
          {Array.isArray(result.steps) && (<div className="rsec"><span className="mono small-label">레시피</span><ol className="steps">{result.steps.map((s, i) => (<li key={i}><span className="mono step-n">{String(i + 1).padStart(2, "0")}</span>{s}</li>))}</ol></div>)}
          {result.tip && (<div className="tip"><span className="mono small-label">한 가지 팁</span><p>{result.tip}</p></div>)}
          {Array.isArray(result.extra) && (<button className={`cart-add wide ${added ? "ok" : ""}`} onClick={() => { addToCart([...(result.uses || []), ...(result.extra || [])]); setAdded(true); setTimeout(() => setAdded(false), 1200); }}>
            {added ? <><Check size={14} /> 장보기에 담음</> : <><Plus size={14} /> 재료 장보기에 담기</>}
          </button>)}
        </article>
      )}
    </div>
  );
}

/* ---------------------------- 오버레이 ---------------------------- */
function Overlay({ children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="닫기"><X size={18} /></button>
        {children}
      </div>
    </div>
  );
}

/* --------------------------- 장보기 메모 --------------------------- */
function CartNote({ cart, setCart, onClear }) {
  const [showStaple, setShowStaple] = useState(false);
  const toggle = (i) => setCart((p) => p.map((x, k) => (k === i ? { ...x, done: !x.done } : x)));
  const remove = (i) => setCart((p) => p.filter((_, k) => k !== i));

  const groups = {};
  cart.forEach((it, idx) => { const c = ingCategory(it.name); (groups[c] = groups[c] || []).push({ ...it, idx }); });
  const staples = groups["상비"] || [];
  const freshCats = CART_ORDER.filter((c) => groups[c]);
  const freshCount = cart.length - staples.length;

  const Item = ({ it }) => (
    <li className={it.done ? "done" : ""}>
      <button className="tick" onClick={() => toggle(it.idx)}>{it.done && <Check size={12} />}</button>
      <span className="note-item" onClick={() => toggle(it.idx)}>{it.name}</span>
      <button className="note-del" onClick={() => remove(it.idx)} aria-label="삭제"><X size={13} /></button>
    </li>
  );

  return (
    <div className="note-card">
      <span className="magnet big" />
      <div className="note-head"><span className="note-title">장보기 메모</span><PencilLine size={16} className="note-pen" /></div>
      {cart.length === 0 ? (
        <p className="note-empty">메뉴의 담기를 누르면<br />재료가 여기 모여요!</p>
      ) : (
        <>
          <p className="note-sub">장 볼 거 {freshCount}가지</p>
          {freshCats.map((c) => (
            <div className="note-group" key={c}>
              <span className="note-cat">{c}</span>
              <ul className="note-list">{groups[c].map((it) => <Item key={it.name} it={it} />)}</ul>
            </div>
          ))}
          {staples.length > 0 && (
            <div className="note-group">
              <button className="staple-toggle" onClick={() => setShowStaple((v) => !v)}>
                <ChevronDown size={14} style={{ transform: showStaple ? "rotate(180deg)" : "none", transition: ".2s" }} />
                상비 재료 {staples.length}가지 {showStaple ? "접기" : "(집에 있는지 확인)"}
              </button>
              {showStaple && <ul className="note-list staple">{staples.map((it) => <Item key={it.name} it={it} />)}</ul>}
            </div>
          )}
          <button className="clear-btn" onClick={onClear}><Trash2 size={13} /> 목록 비우기</button>
        </>
      )}
    </div>
  );
}

/* ----------------------------- 설정 ----------------------------- */
function SettingsPanel({ skip, toggle, allergens, toggleAllergen, customAvoid, addAvoid, removeAvoid }) {
  const [v, setV] = useState("");
  return (
    <div className="set-card">
      <span className="mono small-label">끼니 설정</span>
      <p className="set-desc">유치원·외식 등으로 안 먹는 끼니를 꺼두세요.</p>
      <div className="set-grid">
        <div className="set-row set-header"><span></span>{SLOTS.map((s) => <span key={s.key} className="set-col">{s.ko}</span>)}</div>
        {DAYS.map((d, di) => (
          <div className="set-row" key={d}>
            <span className="set-day">{d}</span>
            {SLOTS.map((s) => { const on = !skip[di][s.key]; return <button key={s.key} className={`set-toggle ${on ? "on" : ""}`} onClick={() => toggle(di, s.key)}>{on ? "먹어요" : "생략"}</button>; })}
          </div>
        ))}
      </div>
      <div className="set-divider" />
      <span className="mono small-label">알러지 · 기피 재료</span>
      <p className="set-desc">선택하면 그 재료가 든 메뉴는 식단에서 빠져요.</p>
      <div className="aller-row">{ALLERGENS.map((a) => (<button key={a.label} className={`aller-chip ${allergens.includes(a.label) ? "on" : ""}`} onClick={() => toggleAllergen(a.label)}>{a.label}</button>))}</div>
      <div className="input-wrap" style={{ marginTop: 12 }}>
        <input className="ing-input" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAvoid(v); setV(""); } }} placeholder="직접 입력 (예: 버섯)" />
        <button className="add-btn" onClick={() => { addAvoid(v); setV(""); }} aria-label="추가"><Plus size={16} /></button>
      </div>
      {customAvoid.length > 0 && (<div className="ing-list" style={{ marginTop: 12, marginBottom: 0 }}>{customAvoid.map((c) => (<span className="ing-chip" key={c}>{c}<button onClick={() => removeAvoid(c)} aria-label="삭제"><X size={12} /></button></span>))}</div>)}
    </div>
  );
}

/* ================================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Gamja+Flower&family=Gaegu:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.muji{
  --paper:#eae3d4; --card:#fbf9f3; --ink:#3b372f; --ink2:#7c7568; --ink3:#a8a08f;
  --line:#e4ddcc; --accent:#a86f4d; --accent-bg:#efe6d8; --sage:#7d8a6a; --sage-bg:#e7ebde;
  font-family:'IBM Plex Sans KR',sans-serif; color:var(--ink); background:var(--paper);
  min-height:100vh; width:100%; display:flex; justify-content:center; -webkit-font-smoothing:antialiased; line-height:1.55;
}
.mono{font-family:'IBM Plex Mono',monospace;}
.app{width:100%; max-width:460px; min-height:100vh; background:var(--paper); padding:28px 22px 56px; display:flex; flex-direction:column; position:relative;}
.hd{display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;}
.brand{font-size:10px; letter-spacing:.2em; color:var(--accent); margin-bottom:7px;}
.title{font-size:30px; font-weight:600; letter-spacing:-.02em; line-height:1;}
.date{font-size:11px; color:var(--ink2); margin-top:9px; letter-spacing:.02em;}
.actions{display:flex; gap:8px;}
.icon-btn{position:relative; width:40px; height:40px; border:1px solid var(--line); background:var(--card); border-radius:11px; cursor:pointer; color:var(--ink2); display:flex; align-items:center; justify-content:center; transition:.18s;}
.icon-btn:hover{color:var(--accent); border-color:var(--accent);}
.badge{position:absolute; top:-6px; right:-6px; min-width:18px; height:18px; padding:0 4px; background:var(--accent); color:#fff; font-size:10px; font-weight:600; border-radius:9px; display:flex; align-items:center; justify-content:center;}
.tabs{display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:22px;}
.tab{flex:1; background:none; border:none; cursor:pointer; font-family:inherit; font-size:16px; color:var(--ink3); padding:13px 0 15px; display:flex; align-items:center; justify-content:center; gap:7px; border-bottom:2px solid transparent; margin-bottom:-1px; transition:.2s;}
.tab svg{opacity:.6;} .tab:hover{color:var(--ink2);}
.tab.on{color:var(--ink); font-weight:600; border-bottom-color:var(--accent);}
.tab.on svg{opacity:1; color:var(--accent);}
.main{flex:1; animation:fade .35s ease both;}
.stack{display:flex; flex-direction:column; gap:14px;}
.card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px 18px; animation:rise .5s cubic-bezier(.2,.7,.3,1) both;}
.meal-top{display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;}
.meal-when{display:flex; align-items:center; gap:8px;}
.dot{width:7px; height:7px; border-radius:50%; flex:none;} .dot.sm{width:6px;height:6px;}
.slot-latin{font-size:9px; letter-spacing:.16em; color:var(--ink3);}
.slot-ko{font-size:14px; color:var(--ink); font-weight:600;}
.slot-time{font-size:10.5px; color:var(--ink3);}
.meal-btns{display:flex; gap:6px;}
.chg,.cart-add{display:flex; align-items:center; gap:5px; cursor:pointer; font-family:inherit; font-size:12.5px; border-radius:20px; padding:7px 13px; transition:.18s; border:1px solid var(--line); background:none; color:var(--ink2);}
.chg:hover{color:var(--accent); border-color:var(--accent); background:var(--accent-bg);}
.cart-add:hover,.cart-add.ok{color:var(--sage); border-color:var(--sage); background:var(--sage-bg);}
.cart-add.wide{width:100%; justify-content:center; margin-top:16px; padding:11px; font-size:13px;}
.meal-body{display:flex; flex-direction:column; gap:11px;}
.food-line{display:flex; align-items:center; gap:11px; animation:fade .4s ease both;}
.food-ic{width:36px; height:36px; flex:none; border-radius:10px; background:var(--accent-bg); color:var(--accent); display:flex; align-items:center; justify-content:center;}
.food-label{font-size:10px; color:var(--ink3); width:30px; flex:none;}
.food-name{font-size:15px; font-weight:500; color:var(--ink); line-height:1.3;}
.skipped,.empty{display:flex; align-items:center; gap:9px; padding:15px 18px; background:#f1ece0; border-style:dashed;}
.skip-note{font-size:11.5px; color:var(--ink3); margin-left:auto;}
.skipped .slot-ko,.empty .slot-ko{color:var(--ink2);}

/* seasonal */
.season-wrap{display:flex; flex-direction:column; gap:9px;}
.season-toggle{display:flex; align-items:center; gap:8px; padding:8px 15px; border-radius:20px; border:1px solid; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:500; transition:.18s; align-self:flex-start;}
.season-toggle:hover{opacity:.8; transform:scale(1.02);}
.season-caret{flex:none; transition:.2s;}
.season-card{border-radius:12px; border:1px solid; padding:15px 17px; animation:rise .3s cubic-bezier(.2,.7,.3,1) both;}
.season-cats{display:flex; flex-direction:column; gap:9px;}
.season-cat-row{display:flex; align-items:flex-start; gap:8px;}
.season-cat-label{font-size:10px; letter-spacing:.08em; font-weight:600; min-width:36px; padding-top:5px; flex:none; text-transform:uppercase; opacity:.85;}
.season-chips{display:flex; flex-wrap:wrap; gap:6px;}
.season-chip{font-size:11.5px; font-weight:500; padding:4px 11px; border-radius:20px;}
.season-note{font-size:12.5px; font-weight:300; line-height:1.6; margin-top:12px; padding-top:12px; border-top:1px solid; text-wrap:balance;}
.season-note b{font-weight:600;}

/* day head layout */
.day-head-r{display:flex; align-items:center; gap:6px;}
.day-reroll{display:flex; align-items:center; justify-content:center; width:24px; height:24px; border:1px solid var(--line); border-radius:7px; background:none; cursor:pointer; color:var(--ink3); transition:.16s; flex:none;}
.day-reroll:hover{color:var(--accent); border-color:var(--accent); background:var(--accent-bg);}
.season-head .small-label{display:none;}
.season-note{font-size:12.5px; color:#5d6b4d; font-weight:300; line-height:1.55; margin-top:12px; text-wrap:balance;}
.season-note b{font-weight:600; color:var(--sage);}

/* two-pane memo */
.memo-row{display:flex; gap:10px; margin-top:8px; align-items:stretch;}
.memo-pane{flex:1; min-width:0; position:relative; border-radius:3px; padding:24px 15px 12px; box-shadow:0 7px 16px rgba(70,70,55,.14); display:flex; flex-direction:column; animation:rise .6s ease both;}
.memo-pane.free{background:#f6efcf; transform:rotate(-1.5deg);}
.memo-pane.kid{background:#e7f0e8; transform:rotate(1.5deg);}
.magnet{position:absolute; top:9px; left:50%; transform:translateX(-50%); width:13px; height:13px; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.25); background:radial-gradient(circle at 35% 30%, #d98a6d, #a8503a);}
.magnet.big{width:16px; height:16px; top:11px;}
.free-mag{background:radial-gradient(circle at 35% 30%, #e7c06a, #c79528);}
.kid-mag{background:radial-gradient(circle at 35% 30%, #7fae8e, #4d7a5e);}
.memo-label{font-family:'Gamja Flower',cursive; font-size:16px; color:#a07f3c; text-align:center; margin:4px 0 6px;}
.memo-label.kid{color:#6f9079;}
.memo-list-wrap{flex:1; display:flex; flex-direction:column; min-height:100px;}
.memo-add{display:flex; gap:5px; margin-bottom:7px;}
.memo-add-input{flex:1; min-width:0; border:none; border-bottom:1.5px dashed #d8c585; background:transparent; outline:none; font-family:'Gamja Flower',cursive; font-size:17px; color:#5e4f2f; padding:2px;}
.memo-add-input::placeholder{color:#c1ac6f;}
.memo-add-btn{flex:none; width:26px; height:26px; border:none; border-radius:7px; background:#e7c06a; color:#6b531a; cursor:pointer; display:flex; align-items:center; justify-content:center;}
.memo-list{list-style:none; display:flex; flex-direction:column; gap:1px; overflow:auto;}
.memo-list li{display:flex; align-items:center; gap:7px; padding:3px 0;}
.tick.sm{width:18px; height:18px;}
.memo-text{flex:1; min-width:0; font-family:'Gamja Flower',cursive; font-size:18px; color:#5e4f2f; cursor:pointer; line-height:1.2; word-break:break-all;}
.memo-list li.done .memo-text{text-decoration:line-through; color:#b3a371;}
.memo-list li.done .tick.sm{background:#cdbd7e; color:#fffdf2;}
.memo-del{flex:none; background:none; border:none; cursor:pointer; color:#bcab73; display:flex; padding:1px;}
.memo-del:hover{color:#8a5a3a;}
.kid-msg{font-family:'Gaegu',cursive; font-weight:700; font-size:18px; line-height:1.4; color:#46604c; text-align:center; text-wrap:balance; flex:1; display:flex; align-items:center; justify-content:center; min-height:100px;}
.kid-sign{display:block; font-family:'Gaegu',cursive; font-size:12px; color:#7c9a82; text-align:right;}

.week-bar{display:flex; justify-content:space-between; align-items:center; padding:0 2px 2px;}
.small-label{font-size:10px; letter-spacing:.16em; color:var(--ink3); text-transform:uppercase;}
.day{padding:15px 17px;} .day.is-today{border-color:var(--accent); background:#fcf6ee;}
.day-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:11px;}
.day-head-l{display:flex; align-items:center; gap:9px;}
.day-name{font-size:15px; font-weight:600;}
.today-tag{font-size:9px; letter-spacing:.1em; color:#fff; background:var(--accent); padding:2px 7px; border-radius:10px;}
.day-meals{display:flex; flex-direction:column; gap:7px;}
.day-row{display:flex; align-items:center; gap:9px; font-size:13px;}
.day-ko{color:var(--ink3); width:28px; flex:none; font-size:12px;}
.day-dish{color:var(--ink);} .day-skip{color:var(--ink3);}

.intro-text{font-size:13.5px; color:var(--ink2); font-weight:300; margin:10px 0 16px;}
.input-wrap{display:flex; gap:8px; margin-bottom:12px;}
.ing-input{flex:1; font-family:inherit; font-size:14px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:11px 13px; outline:none; transition:.18s;}
.ing-input::placeholder{color:var(--ink3);} .ing-input:focus{border-color:var(--accent);}
.add-btn{flex:none; width:42px; background:var(--ink); color:var(--paper); border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:.18s;}
.add-btn:hover{background:var(--accent);}
.ing-list{display:flex; flex-wrap:wrap; gap:7px; margin-bottom:16px;}
.ing-chip{display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--ink); background:var(--accent-bg); padding:6px 8px 6px 12px; border-radius:20px;}
.ing-chip button{background:none; border:none; cursor:pointer; color:var(--accent); display:flex; padding:1px;}
.ing-chip button:hover{color:var(--ink);}
.preset{margin-bottom:18px;} .dim{opacity:.85; display:block; margin-bottom:9px;}
.preset-row{display:flex; flex-wrap:wrap; gap:7px;}
.preset-chip{font-family:inherit; font-size:12.5px; color:var(--ink2); cursor:pointer; background:none; border:1px dashed var(--line); border-radius:20px; padding:5px 11px; transition:.18s;}
.preset-chip:hover{color:var(--accent); border-color:var(--accent); border-style:solid;}
.cook-btn{width:100%; font-family:inherit; font-size:14px; font-weight:500; cursor:pointer; background:var(--ink); color:var(--paper); border:none; border-radius:9px; padding:14px; display:flex; align-items:center; justify-content:center; gap:6px; transition:.18s;}
.cook-btn:hover:not(:disabled){background:var(--accent);} .cook-btn:disabled{opacity:.4; cursor:not-allowed;}
.err{color:var(--accent); font-size:13.5px; text-align:center;}
.result-head{display:flex; align-items:baseline; gap:10px; margin-bottom:8px;}
.dish{font-size:21px; font-weight:600; letter-spacing:-.01em;}
.note{font-size:13.5px; color:var(--ink2); font-weight:300;}
.time-tag{font-size:11px; color:var(--ink3); flex:none;}
.chip{display:inline-block; font-size:11px; color:var(--sage); background:var(--sage-bg); padding:4px 11px; border-radius:20px;}
.season-card .chip{background:#fbf9f3;}
.chip.ghost{background:transparent; color:var(--ink3); border:1px solid var(--line);}
.rsec{margin-top:18px; padding-top:16px; border-top:1px solid var(--line);}
.rsec .small-label{display:block; margin-bottom:11px;}
.steps{list-style:none; display:flex; flex-direction:column; gap:11px;}
.steps li{display:flex; gap:11px; font-size:13.5px; color:var(--ink2); font-weight:300; line-height:1.5;}
.step-n{color:var(--accent); flex:none; font-size:11px; padding-top:2px;}
.tip{margin-top:18px; padding:14px 16px; background:var(--accent-bg); border-radius:8px;}
.tip .small-label{display:block; margin-bottom:6px; color:var(--accent);}
.tip p{font-size:13px; color:var(--ink); font-weight:300;}
.ft{text-align:center; font-size:10px; letter-spacing:.14em; color:var(--ink3); margin-top:30px;}

.overlay{position:fixed; inset:0; background:rgba(50,44,34,.34); display:flex; align-items:center; justify-content:center; padding:24px; z-index:50; animation:fade .2s ease both; overflow-y:auto;}
.sheet{position:relative; width:100%; max-width:380px; margin:auto; background:#faf8f3; border-radius:18px; animation:pop .3s cubic-bezier(.2,.8,.3,1) both;}
.sheet-close{position:absolute; top:-12px; right:-12px; width:30px; height:30px; border-radius:50%; background:var(--ink); color:var(--paper); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2;}

/* cart note */
.note-card{position:relative; background:#f6eecb; border-radius:4px; padding:32px 26px 24px; box-shadow:0 12px 28px rgba(70,60,40,.25); transform:rotate(-.8deg);}
.note-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;}
.note-title{font-family:'Gamja Flower',cursive; font-size:36px; color:#5e4f2f; line-height:1;}
.note-pen{color:#b09a55;}
.note-sub{font-family:'Gamja Flower',cursive; font-size:20px; color:#9a8650; margin-bottom:14px;}
.note-empty{font-family:'Gamja Flower',cursive; font-size:26px; color:#8a784a; text-align:center; line-height:1.5; padding:18px 0; text-wrap:balance;}
.note-group{margin-bottom:14px;}
.note-cat{display:block; font-family:'Gamja Flower',cursive; font-size:19px; color:#a07f3c; border-bottom:1.5px solid #e2d09a; padding-bottom:2px; margin-bottom:4px;}
.note-list{list-style:none; display:flex; flex-direction:column; gap:2px;}
.note-list li{display:flex; align-items:center; gap:10px; padding:5px 2px;}
.tick{width:20px; height:20px; flex:none; border:1.5px solid #b8a566; border-radius:5px; background:#fffdf2; cursor:pointer; color:#7a6a3a; display:flex; align-items:center; justify-content:center;}
.note-item{flex:1; font-family:'Gamja Flower',cursive; font-size:22px; color:#5e4f2f; cursor:pointer; line-height:1.2;}
.note-list li.done .note-item{text-decoration:line-through; color:#b3a371;}
.note-list li.done .tick{background:#cdbd7e; color:#fffdf2;}
.note-del{background:none; border:none; cursor:pointer; color:#bcab73; display:flex; padding:2px;}
.note-del:hover{color:#8a5a3a;}
.note-list.staple{opacity:.6;}
.staple-toggle{display:flex; align-items:center; gap:5px; font-family:'Gamja Flower',cursive; font-size:18px; color:#a07f3c; background:none; border:none; cursor:pointer; padding:4px 0;}
.clear-btn{margin-top:14px; width:100%; font-family:inherit; font-size:12.5px; color:#8a784a; background:none; border:1px solid #d3bf85; border-radius:8px; padding:9px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:.18s;}
.clear-btn:hover{background:#efe3b8;}

/* settings */
.set-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:24px;}
.set-desc{font-size:12.5px; color:var(--ink2); font-weight:300; margin:9px 0 16px; line-height:1.5;}
.set-grid{display:flex; flex-direction:column; gap:7px;}
.set-row{display:grid; grid-template-columns:34px 1fr 1fr 1fr; gap:7px; align-items:center;}
.set-header .set-col{font-size:11px; color:var(--ink3); text-align:center;}
.set-day{font-size:13px; font-weight:500; color:var(--ink2);}
.set-toggle{font-family:inherit; font-size:11.5px; cursor:pointer; padding:8px 0; border-radius:8px; border:1px dashed var(--line); background:none; color:var(--ink3); transition:.16s;}
.set-toggle.on{border-style:solid; border-color:var(--sage); background:var(--sage-bg); color:var(--sage); font-weight:500;}
.set-toggle:hover{border-color:var(--accent);}
.set-divider{height:1px; background:var(--line); margin:22px 0;}
.aller-row{display:flex; flex-wrap:wrap; gap:7px;}
.aller-chip{font-family:inherit; font-size:12.5px; cursor:pointer; padding:7px 13px; border-radius:20px; border:1px solid var(--line); background:none; color:var(--ink2); transition:.16s;}
.aller-chip:hover{border-color:var(--accent); color:var(--accent);}
.aller-chip.on{background:var(--accent); border-color:var(--accent); color:#fff;}

.spin{animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes rise{from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:none;}}
@keyframes fade{from{opacity:0;} to{opacity:1;}}
@keyframes pop{from{opacity:0; transform:scale(.94);} to{opacity:1; transform:scale(1);}}

/* 직접 편집 FAB */
.edit-fab{position:fixed; bottom:68px; right:16px; background:var(--ink); color:#fff; border:none; border-radius:20px; padding:9px 15px; display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:500; cursor:pointer; box-shadow:0 3px 14px rgba(0,0,0,.22); font-family:inherit; letter-spacing:.02em; z-index:60; transition:.15s;}
.edit-fab:hover{opacity:.85; transform:translateY(-1px);}
.edit-fab:active{transform:scale(.97);}

/* 레시피 버튼 */
.recipe-btn{background:none; border:none; cursor:pointer; padding:3px 5px; color:#b0a890; display:flex; align-items:center; margin-left:auto; flex-shrink:0; border-radius:7px; transition:.12s;}
.recipe-btn:hover{color:#7a9e6a; background:#eef4eb;}

/* 레시피 시트 */
.recipe-sheet{display:flex; flex-direction:column; max-height:80vh; overflow:hidden; background:#faf8f3; border-radius:18px;}
.recipe-hd{display:flex; align-items:flex-start; justify-content:space-between; padding:18px 18px 14px; border-bottom:1px solid #e8e3d9; flex-shrink:0; gap:12px;}
.recipe-dish{font-size:16px; font-weight:700; color:#2c2a25; line-height:1.3;}
.recipe-time{font-size:11.5px; color:#888070; margin-top:3px; font-weight:500;}
.recipe-loading{display:flex; align-items:center; gap:10px; padding:32px 20px; color:#888070; font-size:13.5px;}
.recipe-err{padding:28px 20px; color:#b07070; font-size:13.5px; text-align:center;}
.recipe-nokey{padding:32px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;}
.recipe-nokey span{font-size:28px;}
.recipe-nokey p{font-size:13.5px; line-height:1.7; color:#888070;}
.recipe-nokey b{color:#5a8048; font-weight:600;}
.recipe-body{overflow-y:auto; padding:16px 18px 28px; flex:1;}
.recipe-sec{margin-bottom:18px;}
.recipe-sec-ttl{font-size:10.5px; font-weight:700; color:#a09880; letter-spacing:.1em; text-transform:uppercase; margin-bottom:9px;}
.recipe-ings{display:flex; flex-wrap:wrap; gap:6px;}
.recipe-ing-chip{font-size:12.5px; padding:5px 12px; border-radius:20px; background:#fff; border:1px solid #e0dbd2; color:#4a4640;}
.recipe-steps{padding-left:20px; margin:0; display:flex; flex-direction:column; gap:9px;}
.recipe-steps li{font-size:13.5px; line-height:1.65; color:#3a3830;}
.recipe-tip{background:#fffbe8; border:1px solid #ede8b0; border-radius:11px; padding:11px 14px; font-size:13px; color:#7a6a2a; margin-top:4px; line-height:1.55;}
.result-nav{display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;}
.next-btn{background:none; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; color:var(--sage); font-weight:600; padding:2px 0;}

/* 오늘 메뉴 편집 패널 */
.tedit{display:flex; flex-direction:column; max-height:82vh; overflow:hidden; background:#faf8f3; border-radius:18px;}
.tedit-hd{display:flex; align-items:center; gap:10px; padding:16px 18px 13px; border-bottom:1px solid #e8e3d9; flex-shrink:0; background:#faf8f3; border-radius:18px 18px 0 0;}
.tedit-title{flex:1; text-align:center; font-size:15px; font-weight:600; color:#2c2a25;}
.tedit-save{font-size:13.5px; font-weight:600; color:#7a9e6a; background:none; border:none; cursor:pointer; padding:4px 0; font-family:inherit; letter-spacing:.02em;}
.tedit-body{overflow-y:auto; padding:4px 0 24px; flex:1; background:#faf8f3;}
.tedit-slot{border-bottom:1px solid #e8e3d9;}
.tedit-row{display:flex; align-items:center; gap:8px; width:100%; background:none; border:none; padding:13px 18px; cursor:pointer; font-family:inherit; text-align:left;}
.tedit-lbl{font-size:11.5px; color:#888070; min-width:70px; flex-shrink:0; font-weight:500;}
.tedit-cur{flex:1; font-size:13.5px; font-weight:500; color:#2c2a25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:right; padding-right:6px;}
.tedit-caret{flex:none; transition:.18s; color:#888070;}
.tedit-list{padding:4px 10px 12px; max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; background:#ffffff; border-bottom:1px solid #e8e3d9;}
.tedit-item{padding:11px 12px; border-radius:9px; background:none; border:1px solid transparent; text-align:left; font-size:13.5px; font-family:inherit; cursor:pointer; color:#2c2a25; transition:.1s; display:flex; align-items:center; font-weight:400;}
.tedit-item:hover{background:#f0ede6; border-color:#dedad2;}
.tedit-item.sel{background:#eef4eb; color:#5a8048; font-weight:600; border-color:#a8c89a;}
`;

