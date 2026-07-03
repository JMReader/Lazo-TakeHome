export function AppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2.5"
        y="2.5"
        width="31"
        height="31"
        rx="6.5"
        className="fill-card stroke-border"
      />
      <path
        d="M18 10.25L24.25 12.55V17.2C24.25 21.15 21.72 24.83 18 26.05C14.28 24.83 11.75 21.15 11.75 17.2V12.55L18 10.25Z"
        className="stroke-accent"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 18.15L17.2 20.1L21.15 16.15"
        className="stroke-accent"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
