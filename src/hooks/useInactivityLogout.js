// src/hooks/useInactivityLogout.js
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes until logout
const WARNING_MS = 9 * 60 * 1000; //  9 minutes — show warning 1 min before
const THROTTLE_MS = 30 * 1000; // only update localStorage every 30 seconds
const STORAGE_KEY = "lastActivityAt";

export function useInactivityLogout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  // Keep mutable refs so timer callbacks always see latest values
  const warnTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const lastResetRef = useRef(0); // tracks last time we actually reset

  useEffect(() => {
    const logout = () => {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("patientData");
      router.replace("/");
    };

    const scheduleTimers = (remainingMs) => {
      clearTimeout(warnTimerRef.current);
      clearTimeout(logoutTimerRef.current);

      if (remainingMs <= 0) {
        logout();
        return;
      }

      const warnIn = remainingMs - (TIMEOUT_MS - WARNING_MS);
      if (warnIn > 0) {
        warnTimerRef.current = setTimeout(() => setShowWarning(true), warnIn);
      } else {
        setShowWarning(true);
      }

      logoutTimerRef.current = setTimeout(logout, remainingMs);
    };

    // Throttled reset — only counts as activity at most every 30 seconds
    const reset = () => {
      const now = Date.now();
      if (now - lastResetRef.current < THROTTLE_MS) return; // too soon, ignore
      lastResetRef.current = now;
      localStorage.setItem(STORAGE_KEY, String(now));
      setShowWarning(false);
      scheduleTimers(TIMEOUT_MS);
    };

    // On mount: check elapsed time since last stored activity
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const elapsed = Date.now() - parseInt(stored, 10);
      const remaining = TIMEOUT_MS - elapsed;
      scheduleTimers(remaining);
    } else {
      // Fresh session
      const now = Date.now();
      lastResetRef.current = now;
      localStorage.setItem(STORAGE_KEY, String(now));
      scheduleTimers(TIMEOUT_MS);
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      clearTimeout(warnTimerRef.current);
      clearTimeout(logoutTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  return { showWarning, dismissWarning: () => setShowWarning(false) };
}
