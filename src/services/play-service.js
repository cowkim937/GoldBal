import {
  getDb,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '../firebase/firestore.js';
import { COLLECTIONS } from '../utils/constants.js';

export async function savePlayResult(gameId, userId, result) {
  const docRef = await addDoc(collection(getDb(), COLLECTIONS.PLAYS), {
    gameId,
    userId: userId || 'anonymous',
    result,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPlayHistory(userId) {
  const q = query(
    collection(getDb(), COLLECTIONS.PLAYS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
