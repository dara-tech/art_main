import { cn } from '@/lib/utils';

/** Page content wrapper (top nav lives in AppLayout). */
export default function AppPageShell({ children, wide = false, className }) {
  return (
    <div
      className={cn(
        wide
          ? 'mx-auto w-full max-w-none bg-background px-3 py-3 sm:px-5 sm:py-4 xl:px-6'
          : 'mx-auto bg-background px-3 py-3 sm:px-5 sm:py-4 lg:max-w-[300mm]',
        className
      )}
    >
      {children}
    </div>
  );
}
