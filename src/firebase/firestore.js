import { app, firebaseReady } from './config.js';

const r = (real, mock) => (...args) => (firebaseReady ? real : mock)(...args);

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
  runTransaction as _runTransaction,
  increment as _increment,
  serverTimestamp as _serverTimestamp,
} from 'firebase/firestore';

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
  if (!firebaseReady) return 'mock-db';
  if (!_db) _db = _getFirestore(app);
  return _db;
}

export const collection = r(_collection, mockCollection);
export const doc = r(_doc, mockDoc);
export const getDoc = r(_getDoc, mockGetDoc);
export const getDocs = r(_getDocs, mockGetDocs);
export const setDoc = r(_setDoc, mockSetDoc);
export const updateDoc = r(_updateDoc, mockUpdateDoc);
export const deleteDoc = r(_deleteDoc, mockDeleteDoc);
export const addDoc = r(_addDoc, mockAddDoc);
export const query = r(_query, mockQuery);
export const where = r(_where, mockWhere);
export const orderBy = r(_orderBy, mockOrderBy);
export const limit = r(_limit, mockLimit);
export const increment = r(_increment, mockIncrement);
export const serverTimestamp = r(_serverTimestamp, mockServerTimestamp);
export const runTransaction = r(_runTransaction, mockRunTransaction);
export const startAfter = (...args) => (firebaseReady ? _startAfter(...args) : undefined);
