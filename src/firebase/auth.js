import { app, firebaseReady } from './config.js';
import {
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockOnAuthChange,
} from './mock.js';

const isDev = firebaseReady === false;

// Real Firebase
import {
  getAuth,
  signInWithPopup as _signInWithPopup,
  signOut as _signOut,
  onAuthStateChanged as _onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInAnonymously as _signInAnonymously,
} from 'firebase/auth';

let _auth = null;
let googleProvider = null;
let githubProvider = null;

function getRealAuth() {
  if (!_auth) {
    _auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
  }
  return _auth;
}

export function signInWithGoogle() {
  if (isDev) return mockSignInWithEmailAndPassword('test', 'test1234');
  return _signInWithPopup(getRealAuth(), googleProvider);
}

export function signInWithGithub() {
  if (isDev) return mockSignInWithEmailAndPassword('test', 'test1234');
  return _signInWithPopup(getRealAuth(), githubProvider);
}

export function signInAsAnonymous() {
  if (isDev) return mockSignInWithEmailAndPassword('test', 'test1234');
  return _signInAnonymously(getRealAuth());
}

export function signOutUser() {
  if (isDev) return mockSignOut();
  return _signOut(getRealAuth());
}

export function onAuthChange(callback) {
  if (isDev) return mockOnAuthChange(callback);
  try {
    return _onAuthStateChanged(getRealAuth(), callback);
  } catch (err) {
    callback(null);
    return () => {};
  }
}

export { mockSignInWithEmailAndPassword as signInWithEmail };
