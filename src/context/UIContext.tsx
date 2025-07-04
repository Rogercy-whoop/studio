
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isLoginModalOpen, setLoginModalOpen, isUpgradeModalOpen, setUpgradeModalOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
