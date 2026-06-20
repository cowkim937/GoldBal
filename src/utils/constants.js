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

/** localStorage 키 */
export const STORAGE_KEYS = {
  USER: 'hwangbel_user',
  AUTH_EVENT: 'hwangbel_auth_event',
};
