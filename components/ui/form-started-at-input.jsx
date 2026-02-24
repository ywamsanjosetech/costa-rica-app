"use client";

import { useEffect, useRef } from "react";

export default function FormStartedAtInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = String(Date.now());
  }, []);

  return <input ref={inputRef} type="hidden" name="started_at" defaultValue="" />;
}
