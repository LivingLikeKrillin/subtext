interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#logo-bg)" />
      <path
        d="M108 69 H76 C50 69 36 82 36 100 C36 118 50 127 72 132 L94 138 C114 143 130 155 130 170 C130 184 114 187 90 187 H56 V165 H86 C102 165 108 159 108 152 L82 146 C62 141 58 132 58 118 C58 100 68 91 84 91 H108 Z"
        fill="white"
      />
      <path d="M148 69 H220 V93 H196 V187 H172 V93 H148 Z" fill="white" />
    </svg>
  );
}
