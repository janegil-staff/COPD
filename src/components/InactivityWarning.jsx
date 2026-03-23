// src/components/InactivityWarning.jsx
"use client";

export default function InactivityWarning({ show, onDismiss, t }) {
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
      <span>⏱ {t.sessionExpiring}</span>
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