// src/context/ModalContext.tsx
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext<{
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}>({
  isModalOpen: false,
  setModalOpen: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
