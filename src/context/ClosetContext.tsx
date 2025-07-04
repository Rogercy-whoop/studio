
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import type { ClothingItem, Inspiration } from '@/lib/types';

interface ClosetContextType {
  closetItems: ClothingItem[];
  addClosetItem: (item: Omit<ClothingItem, 'id'>) => Promise<void>;
  removeClosetItem: (id: string) => Promise<void>;
  inspirationItems: Inspiration[];
  addInspirationItem: (inspiration: Omit<Inspiration, 'id'>) => Promise<void>;
  removeInspirationItem: (id: string) => Promise<void>;
  loading: boolean;
}

const ClosetContext = createContext<ClosetContextType | undefined>(undefined);

export function ClosetProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [inspirationItems, setInspirationItems] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);

  // This effect handles all data loading and synchronization.
  // It reacts to changes in the user's authentication state.
  useEffect(() => {
    if (authLoading) return; // Wait until Firebase auth state is confirmed.

    // Firestore listeners need to be detached when the component unmounts or the user logs out.
    let unsubscribeCloset = () => {};
    let unsubscribeInspirations = () => {};

    if (user && db) {
      // USER IS LOGGED IN
      setLoading(true);

      const performMigration = async () => {
        const localClosetJSON = localStorage.getItem('closetItems');
        const localInspirationsJSON = localStorage.getItem('inspirationItems');

        if (localClosetJSON || localInspirationsJSON) {
          const batch = writeBatch(db);

          if (localClosetJSON) {
            const closetToMigrate: Omit<ClothingItem, 'id'>[] = JSON.parse(localClosetJSON);
            const closetCol = collection(db, 'users', user.uid, 'closet');
            closetToMigrate.forEach(item => batch.set(doc(closetCol), item));
            localStorage.removeItem('closetItems');
          }

          if (localInspirationsJSON) {
            const inspirationsToMigrate: Omit<Inspiration, 'id'>[] = JSON.parse(localInspirationsJSON);
            const inspirationsCol = collection(db, 'users', user.uid, 'inspirations');
            inspirationsToMigrate.forEach(item => batch.set(doc(inspirationsCol), item));
            localStorage.removeItem('inspirationItems');
          }
          await batch.commit();
        }
      };

      performMigration().then(() => {
        // After migration (or if none was needed), set up real-time listeners.
        const closetQuery = query(collection(db, 'users', user.uid, 'closet'));
        unsubscribeCloset = onSnapshot(closetQuery, (snapshot) => {
          const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ClothingItem[];
          setClosetItems(items);
          setLoading(false);
        }, (error) => {
           console.error("Error listening to closet:", error);
           setLoading(false);
        });

        const inspirationsQuery = query(collection(db, 'users', user.uid, 'inspirations'));
        unsubscribeInspirations = onSnapshot(inspirationsQuery, (snapshot) => {
          const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Inspiration[];
          setInspirationItems(items);
        }, (error) => {
           console.error("Error listening to inspirations:", error);
        });
      });

    } else {
      // USER IS A GUEST
      setLoading(true);
      try {
        const storedClosetItems = localStorage.getItem('closetItems');
        setClosetItems(storedClosetItems ? JSON.parse(storedClosetItems) : []);
        const storedInspirationItems = localStorage.getItem('inspirationItems');
        setInspirationItems(storedInspirationItems ? JSON.parse(storedInspirationItems) : []);
      } catch (error) {
        console.error("Failed to load items from localStorage", error);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      // Cleanup listeners on unmount or user change
      unsubscribeCloset();
      unsubscribeInspirations();
    };
  }, [user, authLoading]);


  // --- CRUD Functions ---

  const addClosetItem = useCallback(async (item: Omit<ClothingItem, 'id'>) => {
    if (user && db) {
      await addDoc(collection(db, 'users', user.uid, 'closet'), item);
    } else {
      setClosetItems(prevItems => {
        const newItems = [...prevItems, { ...item, id: new Date().toISOString() }];
        localStorage.setItem('closetItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  }, [user]);

  const removeClosetItem = useCallback(async (id: string) => {
    if (user && db) {
      await deleteDoc(doc(db, 'users', user.uid, 'closet', id));
    } else {
      setClosetItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        localStorage.setItem('closetItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  }, [user]);

  const addInspirationItem = useCallback(async (inspiration: Omit<Inspiration, 'id'>) => {
    if (user && db) {
      await addDoc(collection(db, 'users', user.uid, 'inspirations'), inspiration);
    } else {
      setInspirationItems(prevItems => {
        const newItems = [{ ...inspiration, id: new Date().toISOString() }, ...prevItems];
        localStorage.setItem('inspirationItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  }, [user]);

  const removeInspirationItem = useCallback(async (id: string) => {
    if (user && db) {
      await deleteDoc(doc(db, 'users', user.uid, 'inspirations', id));
    } else {
      setInspirationItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        localStorage.setItem('inspirationItems', JSON.stringify(newItems));
        return newItems;
      });
    }
  }, [user]);

  return (
    <ClosetContext.Provider value={{ closetItems, addClosetItem, removeClosetItem, inspirationItems, addInspirationItem, removeInspirationItem, loading }}>
      {children}
    </ClosetContext.Provider>
  );
}

export function useCloset() {
  const context = useContext(ClosetContext);
  if (context === undefined) {
    throw new Error('useCloset must be used within a ClosetProvider');
  }
  return context;
}
