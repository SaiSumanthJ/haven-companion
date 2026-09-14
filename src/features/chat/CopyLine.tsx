"use client";

import { quietBtn } from "@/features/chat/quietBtn";
import { useState } from "react";

export function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={quietBtn}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
