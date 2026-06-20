import {
  getDb,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
  increment,
} from '../firebase/firestore.js';
import { COLLECTIONS } from '../utils/constants.js';

export async function getCredits(uid) {
  try {
    const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return 0;
    return userSnap.data().credits || 0;
  } catch (err) {
    console.warn('크레딧 조회 실패:', err.message);
    return 0;
  }
}

export async function deductCredit(uid, amount) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);

  return runTransaction(getDb(), async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error('사용자 정보를 찾을 수 없어요.');
    }
    const current = userDoc.data().credits || 0;
    if (current < amount) {
      throw new Error(`크레딧이 부족해요. (보유: ${current}, 필요: ${amount})`);
    }
    transaction.update(userRef, { credits: current - amount });
    return current - amount;
  });
}

export async function addCredits(uid, amount) {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  await updateDoc(userRef, { credits: increment(amount) });
}
