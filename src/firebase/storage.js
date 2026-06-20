import { app, firebaseReady } from './config.js';

const isDev = firebaseReady === false;

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
  if (isDev) return 'mock-storage';
  if (!_storage) _storage = _getStorage(app);
  return _storage;
}

export const ref = isDev ? mockStorageRef : _ref;
export const uploadBytes = isDev ? mockUploadBytes : _uploadBytes;
export const getDownloadURL = isDev ? mockGetDownloadURL : _getDownloadURL;
export const deleteObject = isDev ? mockDeleteObject : _deleteObject;
