import {
  getDb,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from '../firebase/firestore.js';
import { COLLECTIONS } from '../utils/constants.js';

export async function hideGame(gameId) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await updateDoc(gameRef, { published: false });
}

export async function unhideGame(gameId) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await updateDoc(gameRef, { published: true });
}

export async function banUser(uid) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  await updateDoc(userRef, { banned: true });
}

export async function unbanUser(uid) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  await updateDoc(userRef, { banned: false });
}

export async function isAdmin(uid) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return false;
  return userSnap.data().role === 'admin';
}

export async function getAllGamesForAdmin() {
  const q = query(collection(getDb(), COLLECTIONS.GAMES), where('published', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getHiddenGames() {
  const q = query(collection(getDb(), COLLECTIONS.GAMES), where('published', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
