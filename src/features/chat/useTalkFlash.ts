import { useEffect, useRef, useState } from "react";
import type { TalkMode } from "@/features/chat/TalkShift";

export function useTalkFlash(mode: TalkMode): boolean {
  const prior = useRef(mode);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prior.current === mode) return;
    prior.current = mode;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 700);
    return () => window.clearTimeout(timer);
  }, [mode]);

  return flash;
}
