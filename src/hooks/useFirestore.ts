import { useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

export const useFirestore = (user: User | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para obter referência de documento do usuário
  const getUserDocRef = (collectionName: string, docId?: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    if (docId) {
      return doc(db, 'users', user.uid, collectionName, docId);
    }
    return collection(db, 'users', user.uid, collectionName);
  };

  // Salvar documento com tratamento de erro melhorado
  const saveDocument = async (collectionName: string, data: any, docId?: string) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      setError(error.message);
      throw error;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Limpar dados undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      if (docId) {
        const docRef = doc(db, 'users', user.uid, collectionName, docId);
        await setDoc(docRef, {
          ...cleanData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        return docId;
      } else {
        const collectionRef = collection(db, 'users', user.uid, collectionName);
        const docRef = await addDoc(collectionRef, {
          ...cleanData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (err: any) {
      console.error('Erro ao salvar documento:', err);
      setError(err.message || 'Erro ao salvar dados');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obter documento com tratamento de erro melhorado
  const getDocument = async (collectionName: string, docId: string) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      setError(error.message);
      throw error;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'users', user.uid, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Converter Timestamps para strings
        const processedData = processFirestoreData(data);
        return { id: docSnap.id, ...processedData };
      }
      return null;
    } catch (err: any) {
      console.error('Erro ao obter documento:', err);
      setError(err.message || 'Erro ao carregar dados');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar documento
  const deleteDocument = async (collectionName: string, docId: string) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      setError(error.message);
      throw error;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'users', user.uid, collectionName, docId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Erro ao deletar documento:', err);
      setError(err.message || 'Erro ao deletar dados');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Escutar mudanças em tempo real com tratamento de erro melhorado
  const subscribeToCollection = (
    collectionName: string, 
    callback: (data: any[]) => void,
    orderByField?: string
  ) => {
    if (!user) {
      console.warn('Tentativa de subscrição sem usuário autenticado');
      return () => {};
    }
    
    try {
      const collectionRef = collection(db, 'users', user.uid, collectionName);
      let q = query(collectionRef);
      
      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, 'desc'));
      }
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          try {
            const data = snapshot.docs.map(doc => {
              const docData = doc.data();
              const processedData = processFirestoreData(docData);
              return {
                id: doc.id,
                ...processedData
              };
            });
            callback(data);
          } catch (err) {
            console.error('Erro ao processar dados da snapshot:', err);
            setError('Erro ao processar dados em tempo real');
          }
        },
        (err) => {
          console.error('Erro na subscrição:', err);
          setError(err.message || 'Erro na sincronização em tempo real');
        }
      );
      
      return unsubscribe;
    } catch (err: any) {
      console.error('Erro ao criar subscrição:', err);
      setError(err.message || 'Erro ao configurar sincronização');
      return () => {};
    }
  };

  // Função para processar dados do Firestore (converter Timestamps)
  const processFirestoreData = (data: any): any => {
    if (!data) return data;
    
    const processed = { ...data };
    
    Object.keys(processed).forEach(key => {
      const value = processed[key];
      if (value && typeof value === 'object' && value.toDate) {
        // É um Timestamp do Firestore
        processed[key] = value.toDate().toISOString();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Processar objetos aninhados recursivamente
        processed[key] = processFirestoreData(value);
      }
    });
    
    return processed;
  };

  // Operação em lote para múltiplas escritas
  const batchWrite = async (operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data?: any;
  }>) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      setError(error.message);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);

      const batch = writeBatch(db);

      operations.forEach(operation => {
        const docRef = operation.docId 
          ? doc(db, 'users', user.uid, operation.collection, operation.docId)
          : doc(collection(db, 'users', user.uid, operation.collection));

        switch (operation.type) {
          case 'set':
            batch.set(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
    } catch (err: any) {
      console.error('Erro na operação em lote:', err);
      setError(err.message || 'Erro na operação em lote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveDocument,
    getDocument,
    deleteDocument,
    subscribeToCollection,
    batchWrite,
    clearError: () => setError(null)
  };
};