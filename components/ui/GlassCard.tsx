import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
  variant?: 'default' | 'panel';
}

/** Reusable premium glassmorphism card */
export default function GlassCard({ children, className = '', hover = false, padding = 'p-6', variant = 'default' }: GlassCardProps) {
  const baseClass = variant === 'panel' ? 'glass-panel' : 'glass';
  return (
    <div
      className={`${baseClass} rounded-2xl ${padding} relative overflow-hidden ${hover ? 'card-hover' : ''} ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
