import {
  getDb,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  runTransaction,
} from '../firebase/firestore.js';
import { getStorageInstance, ref, uploadBytes, getDownloadURL, deleteObject } from '../firebase/storage.js';
import { COLLECTIONS, PAGE_SIZE } from '../utils/constants.js';

export async function createGame(gameData) {
  const docRef = await addDoc(collection(getDb(), COLLECTIONS.GAMES), {
    ...gameData,
    viewCount: 0,
    playCount: 0,
    likeCount: 0,
    published: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getGame(gameId) {
  const docRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function incrementViewCount(gameId) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await runTransaction(getDb(), async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (gameDoc.exists()) {
      transaction.update(gameRef, { viewCount: increment(1) });
    }
  });
}

export async function incrementPlayCount(gameId) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await updateDoc(gameRef, { playCount: increment(1) });
}

async function getGamesByQuery(q) {
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function safeQuery(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.warn('Firestore 조회 실패:', err.message);
      return [];
    }
  };
}

async function _getRecentGames() {
  const q = query(
    collection(getDb(), COLLECTIONS.GAMES),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );
  return getGamesByQuery(q);
}

async function _getPopularGames() {
  const q = query(
    collection(getDb(), COLLECTIONS.GAMES),
    where('published', '==', true),
    orderBy('likeCount', 'desc'),
    limit(PAGE_SIZE)
  );
  return getGamesByQuery(q);
}

async function _getMostViewedGames() {
  const q = query(
    collection(getDb(), COLLECTIONS.GAMES),
    where('published', '==', true),
    orderBy('viewCount', 'desc'),
    limit(PAGE_SIZE)
  );
  return getGamesByQuery(q);
}

async function _searchGames(searchTerm, category, sortBy) {
  const constraints = [where('published', '==', true)];

  if (category && category !== 'all') {
    constraints.push(where('topic', '==', category));
  }

  let orderField = 'createdAt';
  if (sortBy === 'popular') orderField = 'likeCount';
  else if (sortBy === 'views') orderField = 'viewCount';

  constraints.push(orderBy(orderField, 'desc'));
  constraints.push(limit(PAGE_SIZE));

  const q = query(collection(getDb(), COLLECTIONS.GAMES), ...constraints);
  const results = await getGamesByQuery(q);

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    return results.filter(
      (game) =>
        game.title?.toLowerCase().includes(term) ||
        game.description?.toLowerCase().includes(term)
    );
  }
  return results;
}

async function _getUserGames(userId) {
  const q = query(
    collection(getDb(), COLLECTIONS.GAMES),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return getGamesByQuery(q);
}

export const getRecentGames = safeQuery(_getRecentGames);
export const getPopularGames = safeQuery(_getPopularGames);
export const getMostViewedGames = safeQuery(_getMostViewedGames);
export const searchGames = safeQuery(_searchGames);
export const getUserGames = safeQuery(_getUserGames);

export async function updateGame(gameId, data) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await updateDoc(gameRef, data);
}

export async function deleteGame(gameId) {
  const gameRef = doc(getDb(), COLLECTIONS.GAMES, gameId);
  await deleteDoc(gameRef);
}

export async function uploadGameThumbnail(gameId, file) {
  const storageRef = ref(getStorageInstance(), `game-thumbnails/${gameId}`);
  const metadata = { contentType: file.type || 'image/png' };
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  console.log('썸네일 업로드 완료:', url);
  return url;
}

export async function uploadCellImage(gameId, cellId, file, index) {
  const storageRef = ref(getStorageInstance(), `games/${gameId}/${cellId}/image${index}.webp`);
  const metadata = { contentType: file.type || 'image/webp' };
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  console.log('셀 이미지 업로드 완료:', url);
  return url;
}
