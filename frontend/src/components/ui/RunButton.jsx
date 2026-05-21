import { RiLoader4Line, RiPlayCircleLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const filterControlClass = '!h-10 min-h-10 shadow-sm border-border/80';
export const filterLabelClass = 'text-xs font-medium leading-tight text-foreground/80';

export default function RunButton({
  disabled = false,
  loading = false,
  onClick,
  label = 'Run',
  loadingLabel = 'Running...',
  className = ''
}) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        filterControlClass,
        'min-w-24 gap-1.5 rounded-none bg-primary text-primary-foreground hover:opacity-95',
        className
      )}
    >
      {loading ? <RiLoader4Line className="size-4 animate-spin" /> : <RiPlayCircleLine className="size-4" />}
      {loading ? loadingLabel : label}
    </Button>
  );
}
