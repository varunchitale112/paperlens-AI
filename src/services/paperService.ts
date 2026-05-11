import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';

export interface Paper {
  id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  rawContent?: string;
  summary?: string;
  concepts?: string[];
  mathExplainer?: string;
  mindMapData?: any;
  learningCards?: string[];
}

const PAPERS_COLLECTION = 'papers';

export const getPaper = async (paperId: string): Promise<Paper | null> => {
  const docRef = doc(db, PAPERS_COLLECTION, paperId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Paper;
  }
  return null;
};

export const createPaper = async (paper: Omit<Paper, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PAPERS_COLLECTION), paper);
  return docRef.id;
};

export const updatePaper = async (paperId: string, updates: Partial<Paper>): Promise<void> => {
  const docRef = doc(db, PAPERS_COLLECTION, paperId);
  await updateDoc(docRef, updates);
};
