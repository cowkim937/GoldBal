import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app } from './config.js';

let _auth = null;
let googleProvider = null;

function ensureAuth() {
  if (!_auth) {
    _auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return _auth;
}

export function signInWithGoogle() {
  const auth = ensureAuth();
  return signInWithPopup(auth, googleProvider).catch(() => {
    return signInWithRedirect(auth, googleProvider);
  });
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
  try {
    return onAuthStateChanged(getAuth(app), callback);
  } catch (err) {
    callback(null);
    return () => {};
  }
}
