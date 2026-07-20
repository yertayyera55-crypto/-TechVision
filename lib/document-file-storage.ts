const DATABASE_NAME = "mighty-miners-files-v1";
const STORE_NAME = "documents";
const DATABASE_VERSION = 1;

interface StoredDocumentFile {
  id: string;
  blob: Blob;
  name: string;
  mimeType: string;
  size: number;
  savedAt: string;
}

/**
 * Метаданные заявки остаются в localStorage, а бинарные файлы сохраняются в
 * IndexedDB. localStorage для PDF и изображений не подходит из-за малого лимита.
 */
export async function saveDocumentFile(id: string, file: File) {
  const database = await openDatabase();
  const record: StoredDocumentFile = {
    id,
    blob: file,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    savedAt: new Date().toISOString(),
  };
  await runRequest(database, "readwrite", (store) => store.put(record));
}

export async function getDocumentFile(id: string): Promise<StoredDocumentFile | null> {
  const database = await openDatabase();
  return runRequest<StoredDocumentFile | undefined>(database, "readonly", (store) => store.get(id))
    .then((record) => record ?? null);
}

export async function deleteDocumentFile(id: string) {
  const database = await openDatabase();
  await runRequest(database, "readwrite", (store) => store.delete(id));
}

export async function clearDocumentFiles() {
  const database = await openDatabase();
  await runRequest(database, "readwrite", (store) => store.clear());
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB недоступен в этом браузере."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Не удалось открыть хранилище документов."));
  });
}

function runRequest<T = IDBValidKey>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = createRequest(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Не удалось выполнить операцию с документом."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Не удалось сохранить документ."));
    };
  });
}
