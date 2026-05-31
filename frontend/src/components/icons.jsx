const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const baseClassName = "h-5 w-5";

export const MenuIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const CartIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L22 7H7" />
    <circle cx="10" cy="20" r="1.3" />
    <circle cx="18" cy="20" r="1.3" />
  </svg>
);

export const PlusIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M5 12h14" />
  </svg>
);

export const TruckIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M3 7h11v8H3zM14 10h3l3 3v2h-6z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="18" cy="18" r="1.6" />
  </svg>
);

export const ShieldIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M12 3 5 6v6c0 4.4 2.9 7.8 7 9 4.1-1.2 7-4.6 7-9V6l-7-3Z" />
    <path d="m9.5 12 1.8 1.8L14.8 10" />
  </svg>
);

export const CalendarIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const SparkleIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="m12 3 1.9 4.8L19 9.7l-4 2.6L16.3 17 12 14.4 7.7 17 9 12.3l-4-2.6 5.1-1.9z" />
  </svg>
);

export const WhatsAppIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M20 11.8a8 8 0 0 1-11.8 7l-3.2.9.9-3.1A8 8 0 1 1 20 11.8Z" />
    <path d="M9.4 8.5c.3-.6.6-.6.9-.6h.4c.1 0 .3 0 .4.3.1.2.5 1.3.5 1.4.1.1.1.3 0 .4l-.3.5c-.1.1-.2.2-.1.4.1.2.5.8 1.2 1.3.8.6 1.5.8 1.7.9.2.1.3.1.4-.1l.5-.6c.1-.1.2-.2.4-.1.2.1 1.4.7 1.6.8.2.1.3.2.3.3s-.1.8-.4 1.1c-.3.3-.7.6-1.2.6s-1.5-.2-2.9-.9c-1.7-.8-2.7-2.5-2.8-2.7-.1-.2-.7-1-.7-1.9 0-.9.5-1.4.7-1.7Z" />
  </svg>
);

export const SearchIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const FilterIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const MapPinIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export const ClockIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);

export const PhoneIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M7 4h3l1 4-2 2a14 14 0 0 0 5 5l2-2 4 1v3a2 2 0 0 1-2.2 2A16 16 0 0 1 5 6.2 2 2 0 0 1 7 4Z" />
  </svg>
);

export const BoxIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </svg>
);

export const ClipboardIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <rect x="6" y="5" width="12" height="16" rx="2" />
    <path d="M9 5.5h6M10 3h4v3h-4z" />
  </svg>
);

export const ChartIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M4 20h16" />
    <path d="M7 16V9M12 16V5M17 16v-4" />
  </svg>
);

export const ArrowForwardIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const RulerIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="m4 16 8-8 8 8-8 8Z" />
    <path d="m9 11 1.5 1.5M12 8l1.5 1.5M15 11l1.5 1.5" />
  </svg>
);

export const PaletteIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M12 4a8 8 0 1 0 0 16h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 0-8z" />
    <circle cx="7.5" cy="10" r="0.8" />
    <circle cx="9.5" cy="7.5" r="0.8" />
    <circle cx="12.5" cy="7" r="0.8" />
  </svg>
);

export const PriceTagIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="m3 10 7-7h8l3 3v8l-7 7-11-11Z" />
    <circle cx="14.5" cy="8.5" r="1" />
  </svg>
);

export const FacebookIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8a1 1 0 0 1 1-1Z" />
  </svg>
);

export const InstagramIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="16.8" cy="7.2" r="0.8" />
  </svg>
);

export const SunIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
  </svg>
);

export const LeafIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M20 4c-8.5 0-14 5.5-14 14 8.5 0 14-5.5 14-14Z" />
    <path d="M7 17c2.2-2.8 5.2-5 9-6.5" />
  </svg>
);

export const SnowIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <path d="M12 3v18M5.5 6.5l13 11M18.5 6.5l-13 11" />
    <path d="M9 3.8 12 3l3 0.8M9 20.2 12 21l3-0.8M4.4 8.6 3.8 11l0.8 3M19.6 8.6l0.6 2.4-0.8 3" />
  </svg>
);

export const BlossomIcon = ({ className = baseClassName }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps}>
    <circle cx="12" cy="12" r="1.8" />
    <path d="M12 5c1.7 0 3 1.3 3 3 0 1.2-.8 2.3-2 2.8M19 12c0 1.7-1.3 3-3 3-1.2 0-2.3-.8-2.8-2M12 19c-1.7 0-3-1.3-3-3 0-1.2.8-2.3 2-2.8M5 12c0-1.7 1.3-3 3-3 1.2 0 2.3.8 2.8 2" />
  </svg>
);
