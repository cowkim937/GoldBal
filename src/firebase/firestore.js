import { app, firebaseReady } from './config.js';

const isDev = firebaseReady === false;

// Real Firebase
import {
  getFirestore as _getFirestore,
  collection as _collection,
  doc as _doc,
  getDoc as _getDoc,
  getDocs as _getDocs,
  setDoc as _setDoc,
  updateDoc as _updateDoc,
  deleteDoc as _deleteDoc,
  addDoc as _addDoc,
  query as _query,
  where as _where,
  orderBy as _orderBy,
  limit as _limit,
  startAfter as _startAfter,
  increment as _increment,
  runTransaction as _runTransaction,
  Timestamp as _Timestamp,
  serverTimestamp as _serverTimestamp,
} from 'firebase/firestore';

// Mock
import {
  mockCollection,
  mockDoc,
  mockGetDoc,
  mockGetDocs,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockAddDoc,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockRunTransaction,
  mockIncrement,
  mockServerTimestamp,
} from './mock.js';

let _db = null;

export function getDb() {
  if (isDev) return 'mock-db';
  if (!_db) _db = _getFirestore(app);
  return _db;
}

export const collection = isDev ? mockCollection : _collection;
export const doc = isDev ? mockDoc : _doc;
export const getDoc = isDev ? mockGetDoc : _getDoc;
export const getDocs = isDev ? mockGetDocs : _getDocs;
export const setDoc = isDev ? mockSetDoc : _setDoc;
export const updateDoc = isDev ? mockUpdateDoc : _updateDoc;
export const deleteDoc = isDev ? mockDeleteDoc : _deleteDoc;
export const addDoc = isDev ? mockAddDoc : _addDoc;
export const query = isDev ? mockQuery : _query;
export const where = isDev ? mockWhere : _where;
export const orderBy = isDev ? mockOrderBy : _orderBy;
export const limit = isDev ? mockLimit : _limit;
export const startAfter = isDev ? (() => {}) : _startAfter;
export const increment = isDev ? mockIncrement : _increment;
export const runTransaction = isDev ? mockRunTransaction : _runTransaction;
export const Timestamp = isDev ? { now: () => new Date() } : _Timestamp;
export const serverTimestamp = isDev ? mockServerTimestamp : _serverTimestamp;
