// hooks/useSecretCode.js

import { useState } from 'react';

const SECRET_CODE = '090883';

export function useSecretCode() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  function handleChange(value) {
    setInput(value);
    if (value === SECRET_CODE) {
      setUnlocked(true);
    }
  }

  function lock() {
    setUnlocked(false);
    setInput('');
  }

  return { input, unlocked, handleChange, lock };
}