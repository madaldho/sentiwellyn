/**
 * One icon set, one stroke language.
 *
 * Rules followed (make-interfaces-feel-better / icons):
 * - Every icon uses `currentColor` so state comes from CSS color, never a second asset.
 * - Uniform 1.5px stroke to sit beside weight-400 Geist text.
 * - 24x24 viewBox, round caps/joins, no fills except where a dot is intentional.
 * - Outline is the default; `filled` marks the active state.
 */

type IconProps = {
  size?: number;
  className?: string;
  filled?: boolean;
};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
  focusable: false as const,
});

/** Sentinel mark: a shield built from connected graph nodes. */
export function IconShield({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3 4.5 6v5.5c0 4.3 3 8.3 7.5 9.5 4.5-1.2 7.5-5.2 7.5-9.5V6L12 3Z" />
      <circle cx="12" cy="9" r="1.4" />
      <circle cx="9" cy="14.5" r="1.1" />
      <circle cx="15" cy="14.5" r="1.1" />
      <path d="M11 10.2 9.6 13.4M13 10.2l1.4 3.2M10.1 14.5h3.8" />
    </svg>
  );
}

/** Overview — a control dashboard, not a house. */
export function IconOverview({ size = 24, className, filled }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3.5" y="4" width="7" height="7" rx="1.5" fill={filled ? "currentColor" : "none"} />
      <rect x="13.5" y="4" width="7" height="4.5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="8.5" rx="1.5" />
      <rect x="3.5" y="14" width="7" height="6" rx="1.5" />
    </svg>
  );
}

/** Scan & Risks — a radar sweep. */
export function IconScan({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3v9" />
      <path d="M12 12 18.5 8.2" />
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/** Proposed Fixes — a change awaiting a decision. */
export function IconFixes({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 7h9" />
      <path d="M4 17h9" />
      <path d="m16.5 4.5 3 2.5-3 2.5" />
      <path d="m16.5 14.5 3 2.5-3 2.5" />
    </svg>
  );
}

/** Runbooks — a document with steps. */
export function IconRunbook({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5.5 3.5h9L19 8v12.5H5.5V3.5Z" />
      <path d="M14 3.5V8h5" />
      <path d="M8.5 12.5h7M8.5 16h4.5" />
    </svg>
  );
}

/** Citation Trail — evidence linked in a chain. */
export function IconCitation({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M7 10v4a3 3 0 0 0 3 3h4" />
    </svg>
  );
}

/** Settings — a control adjustment. */
export function IconSettings({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </svg>
  );
}

export function IconChevronRight({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

export function IconChevronDown({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function IconSearch({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  );
}

export function IconArrowRight({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
    </svg>
  );
}

export function IconArrowUpRight({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7 17 17 7M9.5 7H17v7.5" />
    </svg>
  );
}

export function IconArrowLeft({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M19.5 12h-14M11 6.5 5.5 12 11 17.5" />
    </svg>
  );
}

export function IconClose({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function IconCheck({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Sun — light theme. */
export function IconSun({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  );
}

/** Moon — dark theme. */
export function IconMoon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

/** Evidence source marker used inline in table rows. */
export function IconEvidence({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function IconAlert({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 4 3 19.5h18L12 4Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconExternal({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M13 4h7v7" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5v4A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" />
    </svg>
  );
}

export function IconChat({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 13.5a3 3 0 0 1-3 3H9l-4 3.5v-14a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v7.5Z" />
      <path d="M9 8h8M9 11.5h5" />
    </svg>
  );
}
