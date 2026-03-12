import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
};

function LogoIcon({ iconSize }: { iconSize: number }) {
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Graduation cap */}
      <path d="M50 15L15 35L50 55L85 35L50 15Z" fill="hsl(var(--primary))" />
      <path d="M25 42V62C25 62 35 75 50 75C65 75 75 62 75 62V42L50 55L25 42Z" fill="hsl(var(--primary))" />
      {/* Arrow */}
      <path d="M55 50L75 30" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 30L75 30L75 35" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Green bars */}
      <rect x="58" y="55" width="6" height="20" rx="2" fill="hsl(var(--success))" />
      <rect x="68" y="50" width="6" height="25" rx="2" fill="hsl(var(--success))" />
      <rect x="78" y="45" width="6" height="30" rx="2" fill="hsl(var(--success))" />
    </svg>
  );
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  if (variant === 'icon') {
    return <LogoIcon iconSize={icon} />;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon iconSize={icon} />
      <span className={`font-bold tracking-tight ${text}`}>
        <span className="text-primary">School</span>
        <span className="text-success">Flow</span>
      </span>
    </div>
  );
}
