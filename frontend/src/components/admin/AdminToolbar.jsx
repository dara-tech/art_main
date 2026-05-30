import { RiRefreshLine, RiShieldUserLine, RiUserAddLine, RiUserLine, RiUserSettingsLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
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
        <div className={cn(appNavItemClass(false), 'pointer-events-none border-transparent px-2')} title="Admin">
          <RiUserSettingsLine className={cn(APP_NAV_ICON, 'shrink-0', TOOLBAR_ICON.brand)} aria-hidden />
          <span className="sr-only font-semibold">Admin — Users, roles, and site scope</span>
        </div>
      </Patient360NavRow>

      <Patient360NavRow tone="filters" className="gap-1">
        <VizToolbarBtn
          icon={RiUserLine}
          iconClassName={TOOLBAR_ICON.blue}
          label="Users"
          active={tab === 'users'}
          onClick={() => onTabChange('users')}
          aria-pressed={tab === 'users'}
        />
        <VizToolbarBtn
          icon={RiShieldUserLine}
          iconClassName={TOOLBAR_ICON.violet}
          label="Roles"
          active={tab === 'roles'}
          onClick={() => onTabChange('roles')}
          aria-pressed={tab === 'roles'}
        />
        {tab === 'users' ? (
          <VizToolbarBtn
            icon={RiUserAddLine}
            iconClassName={TOOLBAR_ICON.emerald}
            label="Create user"
            className="ml-auto"
            onClick={onCreateUser}
          />
        ) : null}
        <VizToolbarBtn
          icon={RiRefreshLine}
          iconClassName={TOOLBAR_ICON.cyan}
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
