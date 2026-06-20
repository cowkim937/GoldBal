import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app, firebaseReady } from './config.js';

let _auth = null;
let googleProvider = null;

function createConfigError(message) {
  const error = new Error(message);
  error.code = 'auth/configuration-not-ready';
  return error;
}

function ensureAuthAvailable() {
  if (!firebaseReady || !app) {
    throw createConfigError('Firebase 설정이 준비되지 않았어요. 환경 변수를 확인해주세요.');
  }

  if (!app.options?.authDomain) {
    throw createConfigError('Firebase authDomain 설정이 비어있어요. Cloudflare Pages 대시보드에서 FIREBASE_AUTH_DOMAIN을 확인해주세요.');
  }
}

export function signInWithGoogle() {
  ensureAuthAvailable();
  if (!_auth) {
    _auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return signInWithPopup(_auth, googleProvider);
}

export function signOutUser() {
  if (!_auth) return Promise.resolve();
  return signOut(_auth);
}

export function onAuthChange(callback) {
  if (!firebaseReady || !app) {
    callback(null);
    return () => {};
  }

  try {
    return onAuthStateChanged(getAuth(app), callback);
  } catch (err) {
    callback(null);
    return () => {};
  }
}
