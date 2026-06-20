import { app, firebaseReady } from './config.js';

const r = (real, mock) => (...args) => (firebaseReady ? real : mock)(...args);

import {
  getStorage as _getStorage,
  ref as _ref,
  uploadBytes as _uploadBytes,
  getDownloadURL as _getDownloadURL,
  deleteObject as _deleteObject,
} from 'firebase/storage';

import {
  mockStorageRef,
  mockUploadBytes,
  mockGetDownloadURL,
  mockDeleteObject,
} from './mock.js';

let _storage = null;

export function getStorageInstance() {
  if (!firebaseReady) return 'mock-storage';
  if (!_storage) _storage = _getStorage(app);
  return _storage;
}

export const ref = r(_ref, mockStorageRef);
export const uploadBytes = r(_uploadBytes, mockUploadBytes);
export const getDownloadURL = r(_getDownloadURL, mockGetDownloadURL);
export const deleteObject = r(_deleteObject, mockDeleteObject);
