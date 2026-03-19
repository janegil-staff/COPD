// hooks/useSecretCode.js

import { useState } from "react";

export function useSecretCode() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit() {
    if (input.length !== 6) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input }),
      });
      const data = await res.json();

      if (data.valid) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value) {
    setInput(value);
    setError(false);
  }

  function lock() {
    setUnlocked(false);
    setInput("");
  }

  return { input, unlocked, loading, error, handleChange, handleSubmit, lock };
}
