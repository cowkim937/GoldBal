import { initializeApp } from 'firebase/app';

const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyApeNYXp-uf1u_AyYmdPOtSS7GcZw5cbOA',
  authDomain: 'j-board-61433.firebaseapp.com',
  projectId: 'j-board-61433',
  storageBucket: 'j-board-61433.firebasestorage.app',
  messagingSenderId: '830045263237',
  appId: '1:830045263237:web:b83f5fad1b5d563e67e0ec',
};

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function hasRequiredConfig(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function shouldUseEnvConfig(config) {
  if (!hasRequiredConfig(config)) return false;

  // This app is bound to the j-board-61433 Firebase project.
  // If deploy-time env values point to a different project or incomplete setup,
  // Firebase Auth can throw auth/configuration-not-found at runtime.
  return config.projectId === fallbackFirebaseConfig.projectId;
}

const firebaseConfig = shouldUseEnvConfig(envFirebaseConfig)
  ? envFirebaseConfig
  : fallbackFirebaseConfig;

let app = null;
let firebaseReady = false;

try {
  if (hasRequiredConfig(firebaseConfig)) {
    app = initializeApp(firebaseConfig);
    firebaseReady = true;
    if (!shouldUseEnvConfig(envFirebaseConfig)) {
      console.warn('Firebase: 배포 환경변수(VITE_*)가 누락/불일치하여 기본 설정(j-board-61433)으로 초기화했습니다.');
    }
  } else {
    console.warn('Firebase: 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }
} catch (err) {
  console.error('Firebase 초기화 실패:', err.message);
}

export { app, firebaseReady };
