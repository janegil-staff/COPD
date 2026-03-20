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

const TIMEOUT_MS  = 10 * 60 * 1000; // 10 min
const WARNING_MS  =  9 * 60 * 1000; //  9 min
const THROTTLE_MS = 30 * 1000;       // update localStorage at most every 30s
const STORAGE_KEY = "lastActivityAt";

// Pages that require authentication — show warning + auto-logout on these only
const PROTECTED = ["/dashboard", "/log", "/summary"];

export default function InactivityManager() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [showWarning, setShowWarning] = useState(false);

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));

  useEffect(() => {
    // If we're on a public page, clear timers and do nothing
    if (!isProtected) {
      setShowWarning(false);
      return;
    }

    let warnTimer   = null;
    let logoutTimer = null;
    let lastReset   = 0;

    const logout = () => {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("patientData");
      router.replace("/");
    };

    const scheduleTimers = (remainingMs) => {
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);

      if (remainingMs <= 0) {
        logout();
        return;
      }

      const warnIn = remainingMs - (TIMEOUT_MS - WARNING_MS);
      if (warnIn > 0) {
        warnTimer = setTimeout(() => setShowWarning(true), warnIn);
      } else {
        setShowWarning(true);
      }

      logoutTimer = setTimeout(logout, remainingMs);
    };

    const reset = () => {
      const now = Date.now();
      if (now - lastReset < THROTTLE_MS) return;
      lastReset = now;
      localStorage.setItem(STORAGE_KEY, String(now));
      setShowWarning(false);
      scheduleTimers(TIMEOUT_MS);
    };

    // On mount or navigation: calculate remaining time from stored timestamp
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const elapsed   = Date.now() - parseInt(stored, 10);
      const remaining = TIMEOUT_MS - elapsed;
      scheduleTimers(remaining);
    } else {
      const now = Date.now();
      lastReset = now;
      localStorage.setItem(STORAGE_KEY, String(now));
      scheduleTimers(TIMEOUT_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [isProtected, pathname]); // re-run on every route change

  if (!isProtected) return null;

  return (
    <InactivityWarning
      show={showWarning}
      onDismiss={() => setShowWarning(false)}
      t={t}
    />
  );
}
