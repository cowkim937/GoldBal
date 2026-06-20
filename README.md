# 황밸게임

> 예산으로 뽑는 나만의 밸런스 게임 플랫폼

가로축은 예산 단계, 세로축은 선택 카테고리로 구성된 표에서 각 행마다 하나씩 골라 최고의 조합을 완성하는 밸런스 게임을 직접 만들고 공유할 수 있는 서비스입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | HTML5, Bootstrap 5, Vanilla JS (ES Modules) |
| Backend | Firebase (Auth, Firestore, Storage) |
| Build | Vite |
| Package | pnpm |
| Hosting | Cloudflare Pages |

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (test / test1234 로 로그인 가능)
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

## Firebase 설정

`.env` 파일을 생성하고 Firebase 프로젝트 정보를 입력하세요.

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Firebase 키를 설정하지 않으면 개발 모드(mock)로 동작하며, `test / test1234` 계정으로 모든 기능을 테스트할 수 있습니다.

## 주요 기능

### 게임 만들기
- X축(가격 단계) × Y축(선택 카테고리) 동적 테이블
- 일반 모드: 셀당 이름, 설명, 이미지 1개
- 랜덤 모드: 셀당 여러 세트(이미지+이름+설명) 등록, 플레이 시 랜덤 선택
- X축 가격 입력, 단위 설정
- 예산 남기기 가능/불가능 설정
- 이미지 자동 처리 (WEBP 변환, 1024px 리사이즈, 최대 2MB)

### 게임 플레이
- 각 행에서 하나씩 선택
- 실시간 예산 차감 표시
- 예산 초과 / 예산 남음 검증 모달
- 랜덤 모드: 선택 중 숨김(???), 결과에서 공개
- 결과 공유 (클립보드 복사)

### 커뮤니티
- 좋아요 (중복 방지, Firestore 트랜잭션)
- 조회수 / 플레이수 집계
- 인기순 / 최신순 / 조회순 / 좋아요순 정렬
- 카테고리 필터 (게임, 포켓몬, 애니, 자동차 등 10종)
- 내 게임 / 좋아요한 게임 프로필

### 게임 관리
- 작성자 전용 수정 / 삭제
- 관리자(role=admin) 숨김 / 삭제

## 프로젝트 구조

```
src/
├── main.js              # 진입점
├── style.css            # 전역 스타일
├── firebase/
│   ├── config.js        # Firebase 초기화
│   ├── auth.js          # 인증 (Google, GitHub, Anonymous)
│   ├── firestore.js     # Firestore CRUD
│   ├── storage.js       # Storage 업로드
│   └── mock.js          # 개발 모드 Mock
├── services/
│   ├── auth-service.js  # 로그인/회원가입
│   ├── game-service.js  # 게임 CRUD
│   ├── like-service.js  # 좋아요
│   ├── play-service.js  # 플레이 기록
│   └── admin-service.js # 관리자 기능
├── components/
│   ├── Header.js        # 네비게이션
│   ├── Footer.js        # 푸터
│   ├── GameCard.js      # 게임 카드
│   └── LoginModal.js    # 로그인 모달
├── pages/
│   ├── home.js          # 홈 (그리드 + 페이지네이션)
│   ├── create.js        # 게임 생성/수정
│   ├── game-detail.js   # 게임 플레이
│   ├── profile.js       # 프로필
│   ├── search.js        # 검색
│   └── static.js        # 정책 페이지
└── utils/
    ├── router.js        # SPA 라우터
    ├── seo.js           # 메타 태그
    ├── constants.js     # 상수
    └── image-utils.js   # 이미지 처리
```

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 (게임 그리드) |
| `/create` | 게임 만들기 |
| `/game/:id` | 게임 플레이 |
| `/game/:id/edit` | 게임 수정 |
| `/search` | 게임 탐색 |
| `/profile/:uid` | 사용자 프로필 |
| `/privacy` | 개인정보처리방침 |
| `/terms` | 이용약관 |
| `/about` | 서비스 소개 |
| `/contact` | 문의하기 |
| `/report` | 신고하기 |
| `/content-policy` | 콘텐츠 정책 |
| `/copyright` | 저작권 정책 |
