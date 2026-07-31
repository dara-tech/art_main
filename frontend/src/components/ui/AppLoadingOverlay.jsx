import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { RiDatabase2Line, RiSparklingLine } from '@remixicon/react';

/**
 * AppSpinner — Futuristic dual-orbital ring spinner with pulsing core badge.
 */
export function AppSpinner({ size = 'md', className }) {
  const sizeMap = {
    xs: 'size-4',
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-11',
    xl: 'size-14'
  };

  const ringSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0 select-none', ringSize, className)}>
      {/* Soft ambient aura pulse */}
      <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-teal-500/20 via-sky-500/20 to-purple-600/20 blur-md animate-pulse" />
      
      {/* Outer track ring */}
      <span className="absolute inset-0 rounded-full border border-primary/15" />
      
      {/* Main glowing gradient spinning arc */}
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-r-cyan-400 animate-spin" />
      
      {/* Inner counter-spinning arc */}
      <span className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-indigo-500 border-l-purple-500 animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
      
      {/* Glowing center emblem */}
      <div className="relative flex items-center justify-center size-1/2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-[0_0_10px_rgba(20,184,166,0.6)]">
        <RiSparklingLine className="size-3 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * AppLoadingOverlay — Futuristic glassmorphic loading UI.
 * Consistent across whole app (Full-screen or in-card compact mode).
 */
export default function AppLoadingOverlay({
  show = true,
  message,
  title,
  submessage,
  subtitle,
  fullScreen = false,
  compact = false,
  blur = true,
  size = 'lg',
  className
}) {
  if (!show) return null;

  const msg = title || message || 'កំពុងដំណើរការទិន្នន័យ...';
  const sub = subtitle || submessage || 'Please wait a moment';

  if (compact || !fullScreen) {
    return (
      <div
        className={cn(
          'absolute inset-0 z-30 flex flex-col items-center justify-center p-3 select-none',
          blur ? 'bg-card/80 backdrop-blur-md' : 'bg-card/65',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 text-center p-3"
        >
          <AppSpinner size={size === 'lg' ? 'md' : size} />
          <div className="flex flex-col items-center gap-0.5 max-w-[220px]">
            <span className="text-xs font-bold text-foreground tracking-wide flex items-center justify-center gap-1.5">
              <RiDatabase2Line className="size-3.5 text-teal-500 animate-pulse shrink-0" />
              <span className="truncate">{msg}</span>
            </span>
            {sub && <span className="text-[10px] text-muted-foreground/80 font-medium leading-tight truncate">{sub}</span>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none',
        blur ? 'bg-background/70 backdrop-blur-md' : 'bg-background/50',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden flex flex-col items-center gap-4 px-8 py-6 bg-card/95 border border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] max-w-sm text-center"
      >
        {/* Top ambient color bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-purple-600" />

        {/* Central branded spinner */}
        <AppSpinner size={size} />

        {/* Text content */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-xs font-bold text-foreground tracking-wide flex items-center gap-1.5">
            <RiDatabase2Line className="size-3.5 text-teal-500 animate-pulse" />
            <span>{msg}</span>
          </div>

          {sub && (
            <div className="text-[11px] text-muted-foreground/90 font-medium leading-normal max-w-[240px]">
              {sub}
            </div>
          )}
        </div>

        {/* Animated laser scan beam line */}
        <div className="w-full h-0.5 bg-muted/40 rounded-full overflow-hidden relative mt-1">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-[scan_1.8s_ease-in-out_infinite]" />
        </div>

        {/* Inline CSS animation keyframe for laser scan line */}
        <style>{`
          @keyframes scan {
            0% { left: -35%; }
            50% { left: 100%; }
            100% { left: -35%; }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
