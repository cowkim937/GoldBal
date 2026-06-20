/**
 * Dev Mode Mock - Firebase 없는 개발 환경에서 모든 기능을 시뮬레이션
 * test / test1234 로 로그인 가능
 */

// ============================================================
// In-Memory 데이터 저장소
// ============================================================
const TEST_UID = 'dev-test-uid';

const store = {
  users: new Map([
    ['dev-test-uid', {
      uid: 'dev-test-uid',
      nickname: '테스트',
      email: 'test',
      profileImage: '',
      createdAt: new Date(),
      role: 'admin',
    }],
  ]),
  games: new Map(),
  likes: new Map(),
  plays: new Map(),
};

// localStorage persistence
try {
  const saved = localStorage.getItem('hwangbal_mock_data');
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const [coll, items] of Object.entries(parsed)) {
      if (store[coll]) {
        for (const [key, val] of Object.entries(items)) {
          store[coll].set(key, val);
        }
      }
    }
  }
} catch (e) { /* ignore */ }

function persist() {
  try {
    const data = {};
    for (const [coll, map] of Object.entries(store)) {
      data[coll] = Object.fromEntries(map);
    }
    localStorage.setItem('hwangbal_mock_data', JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

// ============================================================
// Mock Auth
// ============================================================
const MOCK_AUTH_KEY = 'hwangbal_mock_auth';

let mockAuthUser = null;
{
  // Restore auth from localStorage
  const saved = localStorage.getItem(MOCK_AUTH_KEY);
  if (saved) {
    try { mockAuthUser = JSON.parse(saved); } catch(e) {}
  }
}

export function mockSignInWithEmailAndPassword(email, password) {
  if (email === 'test' && password === 'test1234') {
    mockAuthUser = {
      uid: TEST_UID,
      displayName: '테스트',
      email: 'test',
      photoURL: null,
    };
    localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockAuthUser));
    if (mockOnAuthChange_cb) mockOnAuthChange_cb(mockAuthUser);
    return Promise.resolve({ user: mockAuthUser });
  }
  return Promise.reject(new Error('아이디 또는 비밀번호가 올바르지 않아요.'));
}

export function mockSignOut() {
  mockAuthUser = null;
  localStorage.removeItem(MOCK_AUTH_KEY);
  if (mockOnAuthChange_cb) mockOnAuthChange_cb(null);
  return Promise.resolve();
}

var mockOnAuthChange_cb = null;
export function mockOnAuthChange(cb) {
  mockOnAuthChange_cb = cb;
  // Fire synchronously so getCurrentUser() works immediately on page load
  cb(mockAuthUser);
  return () => { mockOnAuthChange_cb = null; };
}

// ============================================================
// Mock Firestore
// ============================================================
let idCounter = 0;
function autoId() {
  return `mock_${Date.now()}_${++idCounter}`;
}

const INCREMENT_MARKER = Symbol('increment');
const SERVER_TS_MARKER = Symbol('serverTimestamp');

function applyFieldValue(val, existing) {
  if (typeof val === 'object' && val !== null) {
    if (val.__op === 'increment') {
      return (Number(existing) || 0) + (val.__delta || 1);
    }
    if (val.__op === 'serverTimestamp') {
      return new Date().toISOString();
    }
  }
  return val;
}

function mergeUpdates(source, updates) {
  const result = { ...source };
  for (const [key, val] of Object.entries(updates)) {
    result[key] = applyFieldValue(val, source[key]);
  }
  return result;
}

function docSnapshot(id, data) {
  if (!data) return { exists: () => false, data: () => null, id };
  return { exists: () => true, data: () => ({ ...data }), id };
}

class MockQuery {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filters = [];
    this.sorts = [];
    this.limitCount = Infinity;
    this.startAfterDoc = null;
  }
}

export function mockCollection(_db, collectionName) {
  return { type: 'collection', name: collectionName };
}

export function mockDoc(_db, collectionName, docId) {
  if (docId === undefined) {
    const parts = collectionName.split('/');
    return { type: 'doc', collection: parts[0], id: parts.slice(1).join('/') };
  }
  return { type: 'doc', collection: collectionName, id: docId };
}

export function mockGetDoc(docRef) {
  const coll = store[docRef.collection];
  if (!coll) return Promise.resolve(docSnapshot(docRef.id, null));
  const data = coll.get(docRef.id);
  return Promise.resolve(docSnapshot(docRef.id, data || null));
}

function resolveValue(val) {
  if (typeof val === 'object' && val !== null) {
    if (val.__op === 'serverTimestamp') return new Date().toISOString();
    if (val.__op === 'increment') return val;
  }
  return val;
}

function resolveData(data) {
  const resolved = {};
  for (const [key, val] of Object.entries(data)) {
    resolved[key] = resolveValue(val);
  }
  return resolved;
}

export function mockSetDoc(docRef, data) {
  if (!store[docRef.collection]) store[docRef.collection] = new Map();
  store[docRef.collection].set(docRef.id, resolveData(data));
  persist();
  return Promise.resolve();
}

export function mockUpdateDoc(docRef, data) {
  if (!store[docRef.collection]) store[docRef.collection] = new Map();
  const existing = store[docRef.collection].get(docRef.id) || {};
  store[docRef.collection].set(docRef.id, mergeUpdates(existing, data));
  persist();
  return Promise.resolve();
}

export function mockAddDoc(colRef, data) {
  const id = autoId();
  if (!store[colRef.name]) store[colRef.name] = new Map();
  store[colRef.name].set(id, resolveData(data));
  persist();
  return Promise.resolve({ id });
}

export function mockDeleteDoc(docRef) {
  if (store[docRef.collection]) {
    store[docRef.collection].delete(docRef.id);
    persist();
  }
  return Promise.resolve();
}

export function mockQuery(colRef, ...constraints) {
  const q = new MockQuery(colRef.name);
  for (const constraint of constraints) {
    if (constraint.type === 'where') {
      q.filters.push(constraint);
    } else if (constraint.type === 'orderBy') {
      q.sorts.push(constraint);
    } else if (constraint.type === 'limit') {
      q.limitCount = constraint.value;
    }
  }
  return q;
}

export function mockWhere(field, op, value) {
  return { type: 'where', field, op, value };
}

export function mockOrderBy(field, dir) {
  return { type: 'orderBy', field, dir };
}

export function mockLimit(n) {
  return { type: 'limit', value: n };
}

export function mockGetDocs(query) {
  const coll = store[query.collectionName];
  if (!coll) return Promise.resolve({ docs: [], empty: true });

  let docs = Array.from(coll.entries()).map(([id, data]) => ({ id, data: () => ({ ...data }) }));

  for (const filter of query.filters) {
    docs = docs.filter((d) => {
      const val = d.data()[filter.field];
      if (filter.op === '==') return val === filter.value;
      return true;
    });
  }

  for (const sort of query.sorts) {
    const dir = sort.dir === 'desc' ? -1 : 1;
    docs.sort((a, b) => {
      const av = a.data()[sort.field];
      const bv = b.data()[sort.field];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }

  if (query.limitCount < Infinity) {
    docs = docs.slice(0, query.limitCount);
  }

  return Promise.resolve({ docs, empty: docs.length === 0 });
}

export function mockRunTransaction(_db, fn) {
  const transaction = {
    get: (docRef) => {
      const coll = store[docRef.collection];
      const data = coll ? coll.get(docRef.id) : null;
      return Promise.resolve(docSnapshot(docRef.id, data));
    },
    set: (docRef, data) => {
      if (!store[docRef.collection]) store[docRef.collection] = new Map();
      store[docRef.collection].set(docRef.id, resolveData(data));
    },
    update: (docRef, data) => {
      if (!store[docRef.collection]) store[docRef.collection] = new Map();
      const existing = store[docRef.collection].get(docRef.id) || {};
      store[docRef.collection].set(docRef.id, mergeUpdates(existing, data));
    },
    delete: (docRef) => {
      if (store[docRef.collection]) store[docRef.collection].delete(docRef.id);
    },
  };
  return fn(transaction).then(() => {
    persist();
  });
}

export function mockIncrement(delta = 1) {
  return { __op: 'increment', __delta: delta };
}

export function mockServerTimestamp() {
  return { __op: 'serverTimestamp' };
}

// ============================================================
// Mock Storage
// ============================================================
const mockStorage = new Map();

export function mockStorageRef(path) {
  return { type: 'storage', path };
}

export function mockUploadBytes(ref, file) {
  const url = URL.createObjectURL(file instanceof Blob ? file : new Blob([file]));
  mockStorage.set(ref.path, { url, blob: file });
  return Promise.resolve();
}

export function mockGetDownloadURL(ref) {
  const item = mockStorage.get(ref.path);
  if (!item) return Promise.reject(new Error('Not found'));
  return Promise.resolve(item.url);
}

export function mockDeleteObject(ref) {
  mockStorage.delete(ref.path);
  return Promise.resolve();
}
