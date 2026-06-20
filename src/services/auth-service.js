import { signInWithGoogle, signOutUser, onAuthChange } from '../firebase/auth.js';
import { getDb, doc, getDoc, setDoc, serverTimestamp } from '../firebase/firestore.js';
import { COLLECTIONS, STORAGE_KEYS } from '../utils/constants.js';

let currentUser = null;
let authListeners = [];

export function getCurrentUser() {
  return currentUser;
}

export function onUserChange(callback) {
  authListeners.push(callback);
  if (currentUser) {
    callback(currentUser);
  }
  return () => {
    authListeners = authListeners.filter((fn) => fn !== callback);
  };
}

function notifyListeners(user) {
  authListeners.forEach((fn) => fn(user));
}

async function createUserProfile(uid, nickname, profileImage) {
  try {
    const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        nickname,
        profileImage: profileImage || '',
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Firebase 미구성: 사용자 프로필 저장 실패');
  }
}

export async function handleGoogleLogin() {
  const result = await signInWithGoogle();
  const user = result.user;
  await createUserProfile(
    user.uid,
    user.displayName || user.email?.split('@')[0] || '사용자',
    user.photoURL || ''
  );
  return user;
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
      };
      notifyListeners(currentUser);

      try {
        const userRef = doc(getDb(), COLLECTIONS.USERS, firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          currentUser = { uid: firebaseUser.uid, ...userSnap.data() };
        }
      } catch (err) {
        // Keep placeholder
      }
    } else {
      currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifyListeners(currentUser);
  });
}
