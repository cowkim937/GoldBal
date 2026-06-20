/**
 * 애플리케이션 상수 정의
 */

/** 기본 카테고리 목록 */
export const CATEGORIES = [
  '게임',
  '포켓몬',
  '애니',
  '자동차',
  '음식',
  '연예인',
  '스포츠',
  'IT',
  '역사',
  '기타',
];

/** 정렬 옵션 */
export const SORT_OPTIONS = {
  LATEST: 'latest',
  POPULAR: 'popular',
  VIEWS: 'views',
  LIKES: 'likes',
};

export const SORT_LABELS = {
  [SORT_OPTIONS.LATEST]: '최신순',
  [SORT_OPTIONS.POPULAR]: '인기순',
  [SORT_OPTIONS.VIEWS]: '조회순',
  [SORT_OPTIONS.LIKES]: '좋아요순',
};

/** 예산 단위 옵션 */
export const BUDGET_UNITS = ['원', '만원', '억원', '포인트', '달러'];

/** X축 개수 범위 */
export const X_COUNT = { MIN: 4, MAX: 10 };

/** Y축 개수 범위 */
export const Y_COUNT = { MIN: 3, MAX: 10 };

/** 이미지 업로드 제한 */
export const IMAGE = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_WIDTH: 1024,
  QUALITY: 0.8,
  FORMAT: 'image/webp',
};

/** Firebase 컬렉션 이름 */
export const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games',
  LIKES: 'likes',
  PLAYS: 'plays',
};

/** 페이지 라우트 */
export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  GAME_DETAIL: '/game/',
  GAME_RESULTS: '/game/:id/results',
  PROFILE: '/profile/',
  SEARCH: '/search',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',
  ABOUT: '/about',
  REPORT: '/report',
  CONTENT_POLICY: '/content-policy',
  COPYRIGHT: '/copyright',
};

/** Firestore 쿼리 제한 */
export const PAGE_SIZE = 24;

/** AI 이미지 생성 설정 */
export const AI_IMAGE = {
  SET: {
    SIZE: '1024x1024',
    QUALITY: 'low',
    CREDITS: 3,
  },
  THUMBNAIL: {
    SIZE: '1024x1024',
    QUALITY: 'high',
    CREDITS: 10,
  },
};

/** 크레딧 시스템 */
export const CREDITS = {
  NEW_USER_DEFAULT: 100,
  PRICE_PER_CREDIT: 10, // KRW (VAT 포함)
  MIN_PURCHASE: 100,
  MAX_PURCHASE: 5000,
};

/** AI 프롬프트 템플릿 */
export const AI_PROMPTS = {
  SET: (name, description) =>
    `밸런스 게임 아이템 이미지. "${name}" 항목. ${description ? `설명: ${description}.` : ''} 상품 카탈로그 스타일의 깔끔한 일러스트. 배경은 심플하게.`,
  THUMBNAIL: (title, description, budget) =>
    `밸런스 게임 '${title}'의 썸네일 배너 이미지. ${description ? `게임 설명: ${description}.` : ''} 예산: ${budget}. 게임의 분위기를 담은 화려한 배너 스타일. 한국어 텍스트 없이 이미지만 생성.`,
};

/** localStorage 키 */
export const STORAGE_KEYS = {
  USER: 'hwangbal_user',
  AUTH_EVENT: 'hwangbal_auth_event',
};
