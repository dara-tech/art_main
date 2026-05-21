import { Link } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiUserSettingsLine
} from '@remixicon/react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/authRoles';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const linkButtonClass = (extra) =>
  cn(buttonVariants({ variant: 'outline', size: 'sm' }), extra);

export default function AppNavActions({ onLogout, showBackToReports = true }) {
  const { user } = useAuth();
  const adminUser = isAdmin(user);

  return (
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
      {showBackToReports ? (
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
      ) : null}
      {adminUser ? (
        <Link
          to="/admin"
          title="Admin panel"
          className={linkButtonClass(
            'inline-flex items-center justify-center gap-1.5 rounded-none border-violet-200 bg-violet-50 px-2.5 text-violet-900 shadow-sm'
          )}
        >
          <RiUserSettingsLine className="size-4" />
          <span className="text-xs">Admin</span>
        </Link>
      ) : null}
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
  );
}
