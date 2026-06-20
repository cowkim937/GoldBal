import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app } from './config.js';

let _auth = null;
let googleProvider = null;

export function signInWithGoogle() {
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
  try {
    return onAuthStateChanged(getAuth(app), callback);
  } catch (err) {
    callback(null);
    return () => {};
  }
}
