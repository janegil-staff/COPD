// src/components/InactivityManager.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import InactivityWarning from "@/components/InactivityWarning";
import { useLang } from "@/context/LangContext";
import no from "@/app/messages/no.json";
import en from "@/app/messages/en.json";
import nl from "@/app/messages/nl.json";
import fr from "@/app/messages/fr.json";
import de from "@/app/messages/de.json";
import it from "@/app/messages/it.json";
import sv from "@/app/messages/sv.json";
import da from "@/app/messages/da.json";
import fi from "@/app/messages/fi.json";
import es from "@/app/messages/es.json";
import pl from "@/app/messages/pl.json";
import pt from "@/app/messages/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

const SESSION_MS = 10 * 60 * 1000; // 10 min hard limit
const WARNING_MS =  9 * 60 * 1000; //  9 min — show warning
const STORAGE_KEY = "sessionStartAt";

// Pages that require authentication
const PROTECTED = ["/dashboard", "/log", "/summary"];

export default function InactivityManager() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [showWarning, setShowWarning] = useState(false);

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (!isProtected) {
      setShowWarning(false);
      return;
    }

    const logout = () => {
      sessionStorage.removeItem("patientData");
      localStorage.removeItem(STORAGE_KEY); // clear so next login starts fresh
      router.replace("/");
    };

    // Record session start time once — do not reset on activity
    let sessionStart = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    if (!sessionStart) {
      sessionStart = Date.now();
      localStorage.setItem(STORAGE_KEY, String(sessionStart));
    }

    const elapsed   = Date.now() - sessionStart;
    const remaining = SESSION_MS - elapsed;

    // Already expired
    if (remaining <= 0) {
      logout();
      return;
    }

    // Schedule warning and logout
    const warnIn = remaining - (SESSION_MS - WARNING_MS);
    const warnTimer   = warnIn > 0 ? setTimeout(() => setShowWarning(true), warnIn) : null;
    const logoutTimer = setTimeout(logout, remaining);

    if (warnIn <= 0) setShowWarning(true);

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
    };
  }, [isProtected, pathname]);

  if (!isProtected) return null;

  return (
    <InactivityWarning
      show={showWarning}
      onDismiss={() => setShowWarning(false)}
      t={t}
    />
  );
}