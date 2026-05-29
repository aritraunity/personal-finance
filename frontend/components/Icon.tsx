"use client";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export default function Icon({ name, className = "", filled = false, size = 24 }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" ${size}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
