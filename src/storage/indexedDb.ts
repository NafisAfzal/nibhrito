export interface LocalOwner {
  id: string;
  profileSlug: string;
  keyId: string;
  publicKey: string;
  privateKey: CryptoKey;
  ownerToken: string;
}
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nibhrito-v1', 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore('owners', { keyPath: 'profileSlug' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error('Private browser storage is unavailable.'));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('owners', mode),
        request = operation(tx.objectStore('owners'));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () =>
        reject(new Error('Private browser storage could not be updated.'));
    });
  } finally {
    db.close();
  }
}
export async function saveOwner(owner: LocalOwner) {
  if (owner.privateKey.extractable || owner.privateKey.type !== 'private')
    throw new Error('An unsafe key cannot be saved.');
  await transaction('readwrite', (store) => store.put(owner));
}
export const loadOwners = () =>
  transaction('readonly', (store) => store.getAll()) as Promise<LocalOwner[]>;
export const forgetOwner = (slug: string) =>
  transaction('readwrite', (store) => store.delete(slug));
