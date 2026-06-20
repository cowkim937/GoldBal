import { signInWithGoogle, signOutUser, onAuthChange } from '../firebase/auth.js';
import { getDb, doc, getDoc, setDoc, serverTimestamp } from '../firebase/firestore.js';
import { COLLECTIONS, STORAGE_KEYS, CREDITS as CREDIT_CONSTANTS } from '../utils/constants.js';

let currentUser = null;
let authListeners = [];

export function getCurrentUser() {
  return currentUser;
}

export function updateUserCredits(credits) {
  if (currentUser) {
    currentUser.credits = credits;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    notifyListeners(currentUser);
  }
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
  const result = await signInWithGoogle();
  return result.user;
}

export async function completeSignup(uid, nickname, photoURL) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      nickname,
      profileImage: photoURL || '',
      credits: CREDIT_CONSTANTS.NEW_USER_DEFAULT,
      createdAt: serverTimestamp(),
    });
    currentUser = {
      uid,
      nickname,
      profileImage: photoURL || '',
      credits: CREDIT_CONSTANTS.NEW_USER_DEFAULT,
    };
  } else {
    const data = userSnap.data();
    currentUser = { uid, nickname, profileImage: photoURL || '', credits: data.credits || 0 };
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  notifyListeners(currentUser);
}

export async function handleLogout() {
  await signOutUser();
  localStorage.removeItem(STORAGE_KEYS.USER);
  currentUser = null;
  notifyListeners(null);
}

export function initAuth() {
  onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      currentUser = {
        uid: firebaseUser.uid,
        nickname: firebaseUser.displayName || '사용자',
        profileImage: firebaseUser.photoURL || '',
        credits: 0,
      };
      notifyListeners(currentUser);
      try {
        const userRef = doc(getDb(), COLLECTIONS.USERS, firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          currentUser = { uid: firebaseUser.uid, ...data };
        }
      } catch (err) {}
    } else {
      currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifyListeners(currentUser);
  });
}
