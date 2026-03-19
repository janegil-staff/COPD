// src/context/LangContext.js
'use client';

import { createContext, useContext, useState } from 'react';

const LangContext = createContext({ lang: 'no', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('no');
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}