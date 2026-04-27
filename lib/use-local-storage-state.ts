"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const readyRef = useRef(false);
  const skipFirstSaveRef = useRef(true);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch {
      // Ignore malformed storage values and keep defaults.
    } finally {
      readyRef.current = true;
      skipFirstSaveRef.current = true;
    }
  }, [key]);

  useEffect(() => {
    if (!readyRef.current) return;
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/storage access errors.
    }
  }, [key, value]);

  return [value, setValue];
}
