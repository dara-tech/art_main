import { Link } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiShieldCheckLine
} from '@remixicon/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const linkButtonClass = (extra) =>
  cn(buttonVariants({ variant: 'outline', size: 'sm' }), extra);

/**
 * Fixed top-right actions shared across secondary pages (API, Queries, DQA).
 */
export default function AppPageShell({ onLogout, children }) {
  return (
    <div className="mx-auto min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-6 lg:max-w-[300mm]">
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="rounded-none border-border/80 bg-card shadow-sm"
          title="Log out"
        >
          <RiLogoutBoxRLine className="size-4" />
        </Button>
        <Link
          to="/"
          title="Back to reports"
          className={linkButtonClass(
            'inline-flex items-center justify-center gap-1.5 rounded-none border-border/80 bg-card shadow-sm'
          )}
        >
          <RiArrowLeftLine className="size-4" />
          <span className="text-xs">Reports</span>
        </Link>
        <Link
          to="/documents"
          title="Backend API reference"
          className={linkButtonClass(
            'inline-flex items-center justify-center gap-1.5 rounded-none border-border/80 bg-card px-2.5 shadow-sm'
          )}
        >
          <RiFileTextLine className="size-4" />
          <span className="text-xs">API</span>
        </Link>
        <Link
          to="/queries"
          title="Indicator SQL reference"
          className={linkButtonClass(
            'inline-flex items-center justify-center gap-1.5 rounded-none border-border/80 bg-card px-2.5 shadow-sm'
          )}
        >
          <RiCodeSSlashLine className="size-4" />
          <span className="text-xs">Queries</span>
        </Link>
        <Link
          to="/dqa"
          title="Data quality assessment"
          className={linkButtonClass(
            'inline-flex items-center justify-center gap-1.5 rounded-none border-border/80 bg-card px-2.5 shadow-sm'
          )}
        >
          <RiShieldCheckLine className="size-4" />
          <span className="text-xs">DQA</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
