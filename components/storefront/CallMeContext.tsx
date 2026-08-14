'use client';

import React, { createContext, useContext, useState } from 'react';

interface CallMeContextType {
  isOpen: boolean;
  productContext?: string;
  openCallMe: (productContext?: string) => void;
  closeCallMe: () => void;
}

const CallMeContext = createContext<CallMeContextType | undefined>(undefined);

export function CallMeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productContext, setProductContext] = useState<string | undefined>(undefined);

  const openCallMe = (context?: string) => {
    setProductContext(context);
    setIsOpen(true);
  };

  const closeCallMe = () => {
    setIsOpen(false);
    setProductContext(undefined);
  };

  return (
    <CallMeContext.Provider value={{ isOpen, productContext, openCallMe, closeCallMe }}>
      {children}
    </CallMeContext.Provider>
  );
}

export function useCallMe() {
  const context = useContext(CallMeContext);
  if (!context) {
    throw new Error('useCallMe must be used within a CallMeProvider');
  }
  return context;
}
