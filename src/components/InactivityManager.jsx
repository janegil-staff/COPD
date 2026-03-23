// src/components/InactivityWarning.jsx
"use client";
import { useState, useEffect } from "react";

export default function InactivityWarning({ show, onDismiss, t }) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!show) {
      setSeconds(60);
      return;
    }
    setSeconds(60);
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[300] flex items-center justify-between px-6 py-3 text-sm font-semibold"
      style={{
        background: "rgba(251,191,36,0.97)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(217,119,6,0.4)",
        color: "#78350f",
      }}
    >
      <span>
        ⏱ {t.sessionExpiring}{" "}
        <span className="font-black tabular-nums">{seconds}s</span>
      </span>
      <button
        onClick={onDismiss}
        className="ml-4 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
        style={{ background: "rgba(0,0,0,0.1)", color: "#78350f" }}
      >
        OK
      </button>
    </div>
  );
}
