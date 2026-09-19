import { useEffect, useRef, useState } from "react";

type FitActions = { save: () => void; discard: () => void };

export function useFitLeave(open: boolean, onClose: () => void, onBlock?: () => void) {
  const [dirty, setDirty] = useState(false);
  const [warn, setWarn] = useState(false);
  const after = useRef<(() => void) | null>(null);
  const actions = useRef<FitActions>({ save: () => undefined, discard: () => undefined });

  function ask(next: () => void) {
    if (!dirty) {
      next();
      return;
    }
    after.current = next;
    onBlock?.();
    setWarn(true);
  }

  function finish(action: "save" | "discard") {
    if (action === "save") actions.current.save();
    else actions.current.discard();
    setWarn(false);
    const next = after.current;
    after.current = null;
    next?.();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") ask(onClose);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dirty, onClose]);

  return {
    dirty,
    warn,
    setDirty,
    bind: (next: FitActions) => {
      actions.current = next;
    },
    ask,
    finish,
  };
}
