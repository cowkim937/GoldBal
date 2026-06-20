import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];
const hasAllKeys = REQUIRED_KEYS.every((k) => firebaseConfig[k]);

let app = null;
let firebaseReady = false;

if (hasAllKeys) {
  try {
    app = initializeApp(firebaseConfig);
    firebaseReady = true;
  } catch (err) {
    console.error('Firebase 초기화 실패:', err.message);
  }
} else {
  const missing = REQUIRED_KEYS.filter((k) => !firebaseConfig[k]);
  const varNames = missing.map((k) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  console.warn(
    `Firebase 환경 변수가 누락되어 mock 모드로 동작합니다.\n` +
    `누락된 변수: ${varNames.join(', ')}\n` +
    `→ Cloudflare Pages 대시보드 → Settings → Environment variables에서 설정하세요.`
  );
}

export { app, firebaseReady };
