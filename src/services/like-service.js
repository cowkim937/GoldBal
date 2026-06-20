import {
  getDb,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  increment,
  runTransaction,
} from '../firebase/firestore.js';
import { COLLECTIONS } from '../utils/constants.js';

export async function toggleLike(gameId, userId) {
  const likeRef = doc(getDb(), COLLECTIONS.LIKES, `${gameId}_${userId}`);
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);

  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await runTransaction(getDb(), async (transaction) => {
      transaction.delete(likeRef);
      transaction.update(gameRef, { likeCount: increment(-1) });
    });
    return false;
  } else {
    await runTransaction(getDb(), async (transaction) => {
      transaction.set(likeRef, { gameId, userId });
      transaction.update(gameRef, { likeCount: increment(1) });
    });
    return true;
  }
}

export async function checkLike(gameId, userId) {
  if (!userId) return false;
  const likeRef = doc(getDb(), COLLECTIONS.LIKES, `${gameId}_${userId}`);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}

export async function getUserLikes(userId) {
  const q = query(
    collection(getDb(), COLLECTIONS.LIKES),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().gameId);
}
