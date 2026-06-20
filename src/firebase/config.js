import { initializeApp } from 'firebase/app';

let app = null;
let firebaseReady = false;

export { app, firebaseReady };

export async function initFirebase() {
  if (firebaseReady) return;

  try {
    const res = await fetch('/api/firebase-config');
    if (!res.ok) {
      console.warn('Firebase 설정을 가져오지 못해 mock 모드로 동작합니다.');
      return;
    }

    const config = await res.json();
    app = initializeApp(config);
    firebaseReady = true;
  } catch (err) {
    console.warn('Firebase 설정 로드 실패, mock 모드로 동작합니다:', err.message);
  }
}
