// src/app/test-code/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";

export default function TestCodePage() {
  const [code, setCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const countdownRef = useRef(null);

  function generateCode() {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  }

  async function handleGenerate() {
    setLoading(true);

    const newCode = generateCode();

    try {
      await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, userId: "test-user" }),
      });

      setCode(newCode);
      startCountdown();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setTimeLeft(600);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const minutes = timeLeft ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft ? String(timeLeft % 60).padStart(2, "0") : "00";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-200 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-teal-300 opacity-30 blur-3xl pointer-events-none" />

      <div
        className="relative z-10 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(38,142,134,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          className="text-xl font-bold tracking-widest uppercase"
          style={{ color: "#268E86", fontFamily: "Georgia, serif" }}
        >
          Code Generator
        </h1>

        {/* Code display */}
        {code ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Your access code
            </p>
            <p
              className="text-4xl font-mono font-bold tracking-[0.3em]"
              style={{ color: "#268E86" }}
            >
              {code}
            </p>

            {/* Countdown */}
            <div className="flex flex-col items-center mt-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                Expires in
              </p>
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: timeLeft < 60 ? "#e53e3e" : "#268E86" }}
              >
                {minutes}:{seconds}
              </p>

              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / 600) * 100}%`,
                    background: timeLeft < 60 ? "#e53e3e" : "#268E86",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-400 text-center">
              {timeLeft === 0
                ? "Code expired. Generate a new one."
                : "No active code."}
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#268E86" }}
        >
          {loading
            ? "Generating..."
            : code
              ? "Generate new code"
              : "Generate code"}
        </button>

        <p className="text-xs text-gray-300 text-center">
          Test page — remove before production
        </p>
      </div>
    </div>
  );
}
