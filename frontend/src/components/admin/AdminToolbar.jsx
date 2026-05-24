import { RiRefreshLine, RiUserAddLine, RiUserSettingsLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_MUTED, APP_NAV_TEXT, p360ControlClass } from '../layout/appNavStyles';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';
import { VizToolbarBtn } from '../visualize/visualizeToolbarUi';

export default function AdminToolbar({
  tab,
  onTabChange,
  onRefresh,
  onCreateUser,
  loading = false
}) {
  return (
    <Patient360NavBar ariaLabel="Admin" rowCount={2}>
      <Patient360NavRow>
        <RiUserSettingsLine className={cn(APP_NAV_ICON, 'shrink-0 text-primary')} aria-hidden />
        <span className={cn('shrink-0 font-semibold', APP_NAV_TEXT)}>Admin</span>
        <span className={cn('hidden min-w-0 truncate text-muted-foreground lg:inline', APP_NAV_MUTED)}>
          Users, roles, and site scope
        </span>
      </Patient360NavRow>

      <Patient360NavRow tone="filters" className="gap-1">
        <VizToolbarBtn
          label="Users"
          active={tab === 'users'}
          onClick={() => onTabChange('users')}
          aria-pressed={tab === 'users'}
        />
        <VizToolbarBtn
          label="Roles"
          active={tab === 'roles'}
          onClick={() => onTabChange('roles')}
          aria-pressed={tab === 'roles'}
        />
        {tab === 'users' ? (
          <VizToolbarBtn
            icon={RiUserAddLine}
            label="Create user"
            className="ml-auto"
            onClick={onCreateUser}
          />
        ) : null}
        <VizToolbarBtn
          icon={RiRefreshLine}
          label="Refresh"
          shortLabel="↻"
          className={tab !== 'users' ? 'ml-auto' : undefined}
          disabled={loading}
          onClick={onRefresh}
        />
      </Patient360NavRow>
    </Patient360NavBar>
  );
}

export { p360ControlClass as adminControlClass };
