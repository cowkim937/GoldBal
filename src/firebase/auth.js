import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app, firebaseReady } from './config.js';

let _auth = null;
let googleProvider = null;

function ensureAuth() {
  if (!firebaseReady || !app) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  if (!_auth) {
    _auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return _auth;
}

export function signInWithGoogle() {
  const auth = ensureAuth();
  try {
    return signInWithPopup(auth, googleProvider);
  } catch (err) {
    return signInWithRedirect(auth, googleProvider);
  }
}

export function handleRedirectResult() {
  if (!_auth) _auth = getAuth(app);
  return getRedirectResult(_auth);
}

export function signOutUser() {
  if (!_auth) return Promise.resolve();
  return signOut(_auth);
}

export function onAuthChange(callback) {
  if (!app) {
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
