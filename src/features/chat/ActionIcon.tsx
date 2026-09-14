type IconProps = { className?: string };

export function ClipIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.5v3.8a5 5 0 0 1-10 0v-9a3.5 3.5 0 1 1 7 0v8.2a2 2 0 0 1-4 0V8"
      />
    </svg>
  );
}

export function MicIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6" />
    </svg>
  );
}

export function DownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.5 12 15l5.5-5.5" />
    </svg>
  );
}

export function InfoIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.2" />
      <path strokeLinecap="round" d="M12 11v5.2M12 8h.01" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3.5h3.1l1.2 3.1-2.1 1.3a12.2 12.2 0 0 0 6.5 6.5l1.3-2.1 3.1 1.2V16.6A2 2 0 0 1 19 18.5 15 15 0 0 1 3.5 5 2 2 0 0 1 5.4 3.5Z"
      />
    </svg>
  );
}
