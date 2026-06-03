import { RiRefreshLine, RiShieldKeyholeLine, RiUserAddLine, RiGroupLine } from '@remixicon/react';
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
    <Patient360NavBar ariaLabel="Admin" rowCount={1}>

      <Patient360NavRow tone="filters" className="gap-1">
        <VizToolbarBtn
          icon={RiGroupLine}
          iconClassName={TOOLBAR_ICON.blue}
          label="Users"
          active={tab === 'users'}
          onClick={() => onTabChange('users')}
          aria-pressed={tab === 'users'}
        />
        <VizToolbarBtn
          icon={RiShieldKeyholeLine}
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
