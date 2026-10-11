import { SavedInterviewAttempt } from '../types/history';

const DB_NAME = 'Mock2Real_InterviewDB';
const DB_VERSION = 1;
const STORE_ATTEMPTS = 'interview_attempts';
const STORE_VIDEOS = 'video_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ATTEMPTS)) {
        const attemptStore = db.createObjectStore(STORE_ATTEMPTS, { keyPath: 'id' });
        attemptStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        // Compound key or unique key: attemptId_questionId
        db.createObjectStore(STORE_VIDEOS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an interview attempt to IndexedDB
 */
export async function saveAttemptToDB(attempt: SavedInterviewAttempt): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ATTEMPTS], 'readwrite');
      const store = transaction.objectStore(STORE_ATTEMPTS);
      const req = store.put(attempt);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save attempt to IndexedDB:', err);
    throw err;
  }
}

/**
 * Get all saved interview attempts ordered by newest first
 */
export async function getAllAttemptsFromDB(): Promise<SavedInterviewAttempt[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ATTEMPTS], 'readonly');
      const store = transaction.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const attempts = (req.result || []) as SavedInterviewAttempt[];
        // Sort descending by timestamp
        attempts.sort((a, b) => b.timestamp - a.timestamp);
        resolve(attempts);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB, returning empty:', err);
    return [];
  }
}

/**
 * Get a single attempt by ID
 */
export async function getAttemptByIdFromDB(id: string): Promise<SavedInterviewAttempt | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ATTEMPTS], 'readonly');
      const store = transaction.objectStore(STORE_ATTEMPTS);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get attempt from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete an attempt and all associated video recordings from IndexedDB
 */
export async function deleteAttemptFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ATTEMPTS, STORE_VIDEOS], 'readwrite');
      const attemptStore = transaction.objectStore(STORE_ATTEMPTS);
      const videoStore = transaction.objectStore(STORE_VIDEOS);

      attemptStore.delete(id);

      // Clean up any video keys starting with id_
      const videoCursorReq = videoStore.openCursor();
      videoCursorReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.key.startsWith(`${id}_`)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('Failed to delete attempt from IndexedDB:', err);
    throw err;
  }
}

/**
 * Save video blob into IndexedDB
 */
export async function saveVideoBlobToDB(
  attemptId: string,
  questionId: string,
  blob: Blob,
  metadata?: { durationSeconds: number; recordedAt: string }
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readwrite');
      const store = transaction.objectStore(STORE_VIDEOS);
      const key = `${attemptId}_${questionId}`;

      const item = {
        key,
        attemptId,
        questionId,
        blob,
        sizeBytes: blob.size,
        mimeType: blob.type,
        durationSeconds: metadata?.durationSeconds || 0,
        recordedAt: metadata?.recordedAt || new Date().toISOString(),
      };

      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save video blob to IndexedDB (storage quota or restriction):', err);
    throw err;
  }
}

/**
 * Retrieve video blob from IndexedDB
 */
export async function getVideoBlobFromDB(
  attemptId: string,
  questionId: string
): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readonly');
      const store = transaction.objectStore(STORE_VIDEOS);
      const key = `${attemptId}_${questionId}`;
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read video blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a specific video blob from IndexedDB
 */
export async function deleteVideoBlobFromDB(attemptId: string, questionId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readwrite');
      const store = transaction.objectStore(STORE_VIDEOS);
      const key = `${attemptId}_${questionId}`;
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete video blob:', err);
  }
}
