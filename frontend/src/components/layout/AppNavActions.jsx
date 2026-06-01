import { NavLink } from 'react-router-dom';
import {
  RiBarChartBoxLine,
  RiBarChartGroupedLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiTestTubeLine,
  RiUserSearchLine,
  RiUserSettingsLine,
  RiDatabase2Line
} from '@remixicon/react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin, isGuest } from '../../utils/authRoles';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_MUTED, APP_NAV_ROW, APP_NAV_TEXT, appNavItemClass } from './appNavStyles';

const navLinkClass = ({ isActive }) => appNavItemClass(isActive);

const adminNavClass = ({ isActive }) =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-1 rounded-none border px-2.5 transition-colors',
    APP_NAV_ROW,
    APP_NAV_TEXT,
    isActive
      ? 'border-violet-200 bg-violet-50 text-violet-900 shadow-none'
      : 'border-transparent text-violet-800/80 hover:border-violet-200 hover:bg-violet-50/80 hover:text-violet-900'
  );

function NavItem({ to, title, children, admin }) {
  return (
    <NavLink to={to} title={title} className={admin ? adminNavClass : navLinkClass}>
      {children}
    </NavLink>
  );
}

export default function AppNavActions({ onLogout }) {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'User';
  const adminUser = isAdmin(user);
  const guestUser = isGuest(user);

  return (
    <header
      className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background pr-1 sm:pr-2"
      aria-label="Global"
    >
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div
          className={cn(
            'flex shrink-0 select-none items-center justify-center bg-teal-600 font-bold text-white',
            APP_NAV_ROW,
            'w-[44px]'
          )}
          title="ART Data"
        >
          ART
        </div>
      </div>

      <NavLink
        to="/reports"
        title="ART Reports"
        className={({ isActive }) =>
          cn(
            'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-none border border-transparent px-2 sm:px-3',
            APP_NAV_ROW,
            APP_NAV_TEXT,
            'transition-colors',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )
        }
      >
        <RiBarChartBoxLine className={cn(APP_NAV_ICON, 'text-primary')} />
        <span className="hidden sm:inline">ART Reports</span>
        <span className="sm:hidden">ART</span>
      </NavLink>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-border/80" aria-hidden />

      <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" aria-label="Main">

        {!guestUser && (
          <>
            <NavItem to="/patient-360" title="ព័ត៌មានអ្នកជំងឺ ៣៦០°">
              <RiUserSearchLine className={APP_NAV_ICON} />
              <span className="hidden md:inline">៣៦០°</span>
            </NavItem>
            <NavItem to="/visualize" title="វិភាគទិន្នន័យ">
              <RiBarChartGroupedLine className={APP_NAV_ICON} />
              <span className="hidden md:inline">វិភាគ</span>
            </NavItem>
            <NavItem to="/country-analytics" title="វិភាគឃ្លាំងទិន្នន័យ (Warehouse Analytics)">
              <RiDatabase2Line className={APP_NAV_ICON} />
              <span className="hidden md:inline">ឃ្លាំងទិន្នន័យ</span>
            </NavItem>
            <NavItem to="/dqa" title="Data quality">
              <RiShieldCheckLine className={APP_NAV_ICON} />
              <span className="hidden md:inline">DQA</span>
            </NavItem>
            <NavItem to="/queries" title="Indicator SQL">
              <RiCodeSSlashLine className={APP_NAV_ICON} />
              <span className="hidden md:inline">Queries</span>
            </NavItem>
            <NavItem to="/documents" title="API reference">
              <RiFileTextLine className={APP_NAV_ICON} />
              <span className="hidden md:inline">API</span>
            </NavItem>
            {adminUser ? (
              <NavItem to="/admin" title="Admin" admin>
                <RiUserSettingsLine className={APP_NAV_ICON} />
                <span className="hidden md:inline">Admin</span>
              </NavItem>
            ) : null}
          </>
        )}
      </nav>

      <div
        className={cn(
          'ml-0.5 flex shrink-0 items-stretch border border-border/70 bg-muted/25',
          APP_NAV_ROW
        )}
        title={displayName}
      >
        <span
          className={cn(
            'flex max-w-[88px] items-center truncate px-2.5 sm:max-w-[128px]',
            APP_NAV_TEXT,
            'text-foreground/85'
          )}
        >
          {displayName}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onLogout}
          className={cn(
            APP_NAV_ROW,
            'w-8 shrink-0 rounded-none border-0 border-l border-border/70 px-0',
            'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
          title="ចាកចេញ"
          aria-label="ចាកចេញ"
        >
          <LogOut className={APP_NAV_ICON} strokeWidth={2} />
        </Button>
      </div>
    </header>
  );
}
