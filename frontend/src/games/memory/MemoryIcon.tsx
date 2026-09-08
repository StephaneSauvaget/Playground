/**
 * The home-page card icon: four cards, one turned over. Inline SVG rather than an
 * image or an emoji, like HangmanFigure — the gallows uses `currentColor` so
 * `.game-card-icon svg { color }` can tint it, and this does the same.
 */
export function MemoryIcon() {
  return (
    <svg viewBox="0 0 96 96" className="memory-icon" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
        <rect x="8" y="10" width="34" height="34" rx="6" />
        <rect x="54" y="10" width="34" height="34" rx="6" />
        <rect x="8" y="52" width="34" height="34" rx="6" />
        <rect x="54" y="52" width="34" height="34" rx="6" />
      </g>
      <g fill="none" stroke="var(--primary-strong)" strokeWidth="5" strokeLinecap="round">
        <circle cx="71" cy="69" r="9" />
        <circle cx="25" cy="27" r="9" />
      </g>
    </svg>
  );
}
