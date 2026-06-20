import { signInWithGoogle, handleRedirectResult, signOutUser, onAuthChange } from '../firebase/auth.js';
import { getDb, doc, getDoc, setDoc, serverTimestamp } from '../firebase/firestore.js';
import { COLLECTIONS, STORAGE_KEYS } from '../utils/constants.js';

let currentUser = null;
let authListeners = [];
let pendingSignup = null;

export function getCurrentUser() {
  return currentUser;
}

export function getPendingSignup() {
  return pendingSignup;
}

export function clearPendingSignup() {
  pendingSignup = null;
  sessionStorage.removeItem('hwangbal_pending_signup');
}

export function onUserChange(callback) {
  authListeners.push(callback);
  if (currentUser) callback(currentUser);
  return () => { authListeners = authListeners.filter((fn) => fn !== callback); };
}

function notifyListeners(user) {
  authListeners.forEach((fn) => fn(user));
}

export async function handleGoogleLogin() {
  try {
    const result = await signInWithGoogle();
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.message?.includes('container')) {
      sessionStorage.setItem('hwangbal_pending_signup', '1');
      return { redirecting: true };
    }
    throw err;
  }
}

export async function completeSignup(uid, nickname, photoURL) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, { uid, nickname, profileImage: photoURL || '', createdAt: serverTimestamp() });
  }
  currentUser = { uid, nickname, profileImage: photoURL || '' };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  clearPendingSignup();
  notifyListeners(currentUser);
}

export async function handleLogout() {
  await signOutUser();
  localStorage.removeItem(STORAGE_KEYS.USER);
  currentUser = null;
  pendingSignup = null;
  notifyListeners(null);
}

export function initAuth() {
  handleRedirectResult().then((result) => {
    if (result?.user) {
      pendingSignup = result.user;
      currentUser = {
        uid: result.user.uid,
        nickname: result.user.displayName || '사용자',
        profileImage: result.user.photoURL || '',
      };
      notifyListeners(currentUser);
    }
  });

  onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      const isNewSignup = !!sessionStorage.getItem('hwangbal_pending_signup');
      currentUser = {
        uid: firebaseUser.uid,
        nickname: firebaseUser.displayName || '사용자',
        profileImage: firebaseUser.photoURL || '',
      };
      if (isNewSignup) {
        pendingSignup = currentUser;
      }
      notifyListeners(currentUser);

      try {
        const userRef = doc(getDb(), COLLECTIONS.USERS, firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          currentUser = { uid: firebaseUser.uid, ...userSnap.data() };
          if (isNewSignup) {
            clearPendingSignup();
          }
        }
      } catch (err) {}
    } else {
      currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifyListeners(currentUser);
  });
}
