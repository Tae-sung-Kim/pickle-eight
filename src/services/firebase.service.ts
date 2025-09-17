import { db } from "@/lib/firebase-config";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    type DocumentData,
    type QueryConstraint,
} from 'firebase/firestore';

/**
 * 컬렉션의 모든 문서를 가져오는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @returns 문서 배열
 */
export const getCollection = async <T extends DocumentData>(
  collectionName: string
): Promise<(T & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({
      ...(doc.data() as T),
      id: doc.id,
    }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
  }
};

/**
 * ID로 특정 문서를 가져오는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @param id - 문서 ID
 * @returns 문서 데이터 또는 찾지 못한 경우 null
 */
export const getDocumentById = async <T extends DocumentData>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...(docSnap.data() as T), id: docSnap.id };
    }
    return null;
  } catch (error) {
    console.error(
      `Error getting document ${id} from ${collectionName}:`,
      error
    );
    throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
  }
};

/**
 * 쿼리 조건에 맞는 문서를 가져오는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @param constraints - Firestore 쿼리 제약 조건 배열
 * @returns 쿼리와 일치하는 문서 배열
 */
export const queryDocuments = async <T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...(doc.data() as T),
      id: doc.id,
    }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
  }
};

/**
 * 컬렉션에 새 문서를 추가하는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @param data - 추가할 데이터
 * @returns 새로 생성된 문서의 참조
 */
export const addDocument = async <T extends object>(
  collectionName: string,
  data: T
) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw new Error('서버에 데이터를 추가하는데 실패했습니다.');
  }
};

/**
 * 문서를 업데이트하는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @param id - 업데이트할 문서 ID
 * @param data - 업데이트할 데이터
 */
export const updateDocument = async <T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    throw new Error('서버의 데이터를 업데이트하는데 실패했습니다.');
  }
};

/**
 * 문서를 삭제하는 제네릭 함수
 * @param collectionName - 컬렉션 이름
 * @param id - 삭제할 문서 ID
 */
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(
      `Error deleting document ${id} from ${collectionName}:`,
      error
    );
    throw new Error('서버에서 데이터를 삭제하는데 실패했습니다.');
  }
};
