import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { RiDatabase2Line, RiSparklingLine } from '@remixicon/react';

/**
 * AppSpinner — Dual-orbital ring spinner using active theme CSS variables.
 */
export function AppSpinner({ size = 'md', className }) {
  const sizeMap = {
    xs: 'size-4',
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
    xl: 'size-13'
  };

  const ringSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0 select-none', ringSize, className)}>
      {/* Soft ambient aura pulse */}
      <span className="absolute -inset-2 rounded-full bg-primary/15 blur-md animate-pulse" />

      {/* Outer track ring */}
      <span className="absolute inset-0 rounded-full border border-primary/20" />

      {/* Main spinning arc */}
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin" />

      {/* Inner counter-spinning arc */}
      <span className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-primary/80 border-l-primary/40 animate-spin [animation-duration:1.1s] [animation-direction:reverse]" />

      {/* Glowing center emblem */}
      <div className="relative flex items-center justify-center size-1/2 rounded-full bg-primary text-primary-foreground shadow-xs">
        <RiSparklingLine className="size-3 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * AppLoadingOverlay — Enterprise glassmorphic loading UI overlay.
 * Single-line text wrap prevention, dynamic theme color alignment.
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
          blur ? 'bg-card/85 backdrop-blur-md' : 'bg-card/70',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 text-center p-3 max-w-full overflow-hidden"
        >
          <AppSpinner size={size === 'lg' ? 'md' : size} />
          <div className="flex flex-col items-center gap-0.5 w-full max-w-[260px] overflow-hidden">
            <span className="text-xs font-bold text-foreground tracking-wide flex items-center justify-center gap-1.5 w-full whitespace-nowrap truncate overflow-hidden">
              <RiDatabase2Line className="size-3.5 text-primary animate-pulse shrink-0" />
              <span className="truncate whitespace-nowrap">{msg}</span>
            </span>
            {sub && (
              <span className="text-[10px] text-muted-foreground font-semibold leading-tight truncate whitespace-nowrap w-full">
                {sub}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[140] flex flex-col items-center justify-center p-4 select-none',
        blur ? 'bg-background/80 backdrop-blur-md' : 'bg-background/60',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden flex flex-col items-center gap-3.5 px-7 py-5 bg-card border border-border/80 rounded-none shadow-xl max-w-md w-full text-center"
      >
        {/* Top ambient theme color bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-primary" />

        {/* Central branded spinner */}
        <AppSpinner size={size} />

        {/* Text content */}
        <div className="flex flex-col items-center gap-1 w-full max-w-[340px] overflow-hidden">
          <div className="text-xs font-bold text-foreground tracking-wide flex items-center justify-center gap-1.5 w-full whitespace-nowrap truncate overflow-hidden">
            <RiDatabase2Line className="size-3.5 text-primary animate-pulse shrink-0" />
            <span className="truncate whitespace-nowrap">{msg}</span>
          </div>

          {sub && (
            <div className="text-[11px] text-muted-foreground font-semibold leading-normal max-w-[300px] truncate whitespace-nowrap w-full">
              {sub}
            </div>
          )}
        </div>

        {/* Animated laser scan beam line */}
        <div className="w-full h-0.5 bg-muted/60 rounded-none overflow-hidden relative mt-1">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_1.6s_ease-in-out_infinite]" />
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
