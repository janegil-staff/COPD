// src/context/LangContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext({ lang: "no", setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("no");

  // On mount, restore saved language
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLangState(saved);
  }, []);

  // Persist every time the user changes language
  const setLang = (newLang) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
