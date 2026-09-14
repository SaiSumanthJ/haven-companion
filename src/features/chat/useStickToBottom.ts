"use client";

import { useEffect, useRef, useState } from "react";

const NEAR_BOTTOM = 96;

export function useStickToBottom(follow: boolean, token: string) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [away, setAway] = useState(false);

  function stick() {
    const el = scrollerRef.current;
    if (!el || !pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    pinnedRef.current = near;
    setAway(!near);
  }

  function jumpToLatest() {
    pinnedRef.current = true;
    setAway(false);
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  useEffect(() => {
    if (follow) pinnedRef.current = true;
  }, [follow]);

  useEffect(() => {
    stick();
  }, [token, follow]);

  return { scrollerRef, away, onScroll, jumpToLatest };
}
