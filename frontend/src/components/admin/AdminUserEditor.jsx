import { useEffect, useMemo, useState } from 'react';
import { RiDeleteBinLine } from '@remixicon/react';
import { toast } from 'sonner';
import adminApi from '../../services/adminApi';
import AdminScopeFields from './AdminScopeFields';
import AdminModalShell, { AdminModalBtn, AdminModalSection } from './AdminModalShell';
import { formatOrgUnitLabel } from '../../utils/provinces';
import { cn } from '@/lib/utils';
import { P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

const inputClass = cn(p360ControlClass, 'h-8 w-full');

export default function AdminUserEditor({
  preview,
  user,
  loading = false,
  error = '',
  roles,
  sites,
  provinces = [],
  ods = [],
  onClose,
  onUpdated
}) {
  const [saving, setSaving] = useState(false);
  const [addRoleId, setAddRoleId] = useState('');
  const [scopeType, setScopeType] = useState('site');
  const [siteId, setSiteId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [odCode, setOdCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const assignedRoleIds = useMemo(() => new Set((user?.roles || []).map((r) => r.id)), [user]);
  const availableRoles = useMemo(
    () => (roles || []).filter((r) => !assignedRoleIds.has(r.id)),
    [roles, assignedRoleIds]
  );

  useEffect(() => {
    if (availableRoles.length && !addRoleId) {
      setAddRoleId(String(availableRoles[0].id));
    }
  }, [availableRoles, addRoleId]);

  useEffect(() => {
    if (sites?.length && !siteId) {
      setSiteId(String(sites[0].id));
    }
  }, [sites, siteId]);

  useEffect(() => {
    if (provinces?.length && !provinceId) {
      setProvinceId(String(provinces[0].id));
    }
  }, [provinces, provinceId]);

  useEffect(() => {
    if (ods?.length && !odCode) {
      setOdCode(String(ods[0].code));
    }
  }, [ods, odCode]);

  useEffect(() => {
    setNewPassword('');
    setConfirmPassword('');
  }, [user?.id]);

  const runAction = async (label, fn) => {
    setSaving(true);
    try {
      const res = await fn();
      onUpdated(res.user);
      toast.success(label);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const display = user || preview;
  if (!display) return null;

  const isScoped = (user?.orgUnits || []).length > 0;

  return (
    <AdminModalShell
      wide
      title={display.fullName || display.username || 'User'}
      description={
        display.username
          ? `@${display.username}${display.email ? ` · ${display.email}` : ''}`
          : undefined
      }
      onClose={onClose}
    >
      {loading ? (
        <div
          className={cn(
            'flex min-h-[14rem] items-center justify-center text-muted-foreground',
            P360_TABLE_TEXT
          )}
        >
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            Loading user…
          </span>
        </div>
      ) : error ? (
        <div className={cn('py-10 text-destructive', P360_TABLE_TEXT)}>{error}</div>
      ) : !user ? (
        <div className={cn('py-10 text-muted-foreground', P360_TABLE_TEXT)}>User not found.</div>
      ) : (
      <div className="space-y-4">
        <dl className={cn('grid grid-cols-[auto_1fr] gap-x-3 gap-y-1', P360_TABLE_TEXT)}>
          <dt className="text-muted-foreground">Last login</dt>
          <dd className="tabular-nums">{fmtDate(user.lastLoginAt)}</dd>
        </dl>

        <AdminModalSection title="Password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            autoComplete="new-password"
            className={inputClass}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className={inputClass}
          />
          <AdminModalBtn
            variant="primary"
            disabled={saving || !newPassword}
            onClick={() => {
              if (newPassword !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }
              runAction('Password updated', async () => {
                const res = await adminApi.changePassword(user.id, newPassword);
                setNewPassword('');
                setConfirmPassword('');
                return res;
              });
            }}
          >
            Set new password
          </AdminModalBtn>
        </AdminModalSection>

        <AdminModalSection title="Account status">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                P360_TABLE_TEXT,
                user.active ? 'text-emerald-800 dark:text-emerald-400' : 'text-destructive'
              )}
            >
              {user.active ? 'Active' : 'Disabled'}
            </span>
            <AdminModalBtn
              disabled={saving}
              onClick={() =>
                runAction(user.active ? 'User disabled' : 'User activated', () =>
                  adminApi.updateUserStatus(user.id, !user.active)
                )
              }
            >
              {user.active ? 'Disable account' : 'Enable account'}
            </AdminModalBtn>
          </div>
        </AdminModalSection>

        <AdminModalSection title="Roles">
          <ul className="space-y-2">
            {(user.roles || []).map((r) => (
              <li key={r.assignmentId} className="flex items-center justify-between gap-2">
                <div className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
                  <span className="font-medium">{r.name}</span>
                  <code className="text-muted-foreground">{r.slug}</code>
                </div>
                <button
                  type="button"
                  className={cn(p360ControlClass, 'h-8 w-8 text-destructive')}
                  disabled={saving}
                  onClick={() =>
                    runAction('Role removed', () => adminApi.removeRole(user.id, r.assignmentId))
                  }
                  aria-label="Remove role"
                >
                  <RiDeleteBinLine className="size-4" />
                </button>
              </li>
            ))}
            {!user.roles?.length ? (
              <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>No roles — user is Guest.</p>
            ) : null}
          </ul>
          {availableRoles.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <select
                value={addRoleId}
                onChange={(e) => setAddRoleId(e.target.value)}
                className={cn(p360ControlClass, 'h-8 min-w-[10rem] flex-1')}
              >
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <AdminModalBtn
                variant="primary"
                disabled={saving || !addRoleId}
                onClick={() =>
                  runAction('Role assigned', () => adminApi.assignRole(user.id, Number(addRoleId)))
                }
              >
                Add role
              </AdminModalBtn>
            </div>
          ) : null}
        </AdminModalSection>

        <AdminModalSection title="Site access">
          <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
            {isScoped
              ? 'Scoped to specific sites / provinces / ODs via user_org_units.'
              : 'No scope rows — user can access all sites.'}
          </p>

          {user.assignedSites?.length ? (
            <p className={P360_TABLE_TEXT}>
              <span className="font-medium">Facilities:</span> {user.assignedSites.join(', ')}
            </p>
          ) : null}

          <ul className="space-y-2">
            {(user.orgUnits || []).map((unit) => (
              <li
                key={unit.id}
                className={cn(
                  'flex items-center justify-between gap-2 border border-border/70 bg-background px-2 py-1.5',
                  P360_TABLE_TEXT
                )}
              >
                <span>{formatOrgUnitLabel(unit)}</span>
                <button
                  type="button"
                  className={cn(p360ControlClass, 'h-8 w-8 text-destructive')}
                  disabled={saving}
                  onClick={() =>
                    runAction('Scope removed', () => adminApi.removeOrgUnit(user.id, unit.id))
                  }
                  aria-label="Remove scope"
                >
                  <RiDeleteBinLine className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <AdminModalBtn
            disabled={saving || !isScoped}
            onClick={() => runAction('All sites access restored', () => adminApi.clearOrgUnits(user.id))}
          >
            Allow all sites
          </AdminModalBtn>

          <div className="space-y-2 border-t border-border/70 pt-3">
            <p className={cn('font-medium', P360_TABLE_TEXT)}>Add scope</p>
            <AdminScopeFields
              scopeType={scopeType}
              onScopeTypeChange={setScopeType}
              siteId={siteId}
              onSiteIdChange={setSiteId}
              provinceId={provinceId}
              onProvinceIdChange={setProvinceId}
              odCode={odCode}
              onOdCodeChange={setOdCode}
              sites={sites}
              provinces={provinces}
              ods={ods}
            />
            <AdminModalBtn
              variant="primary"
              disabled={saving || (scopeType === 'province' && !provinceId)}
              onClick={() => {
                const payload = { scopeType };
                if (scopeType === 'site') payload.siteId = Number(siteId);
                if (scopeType === 'province') payload.provinceId = Number(provinceId);
                if (scopeType === 'od') payload.odCode = odCode.trim();
                runAction('Scope added', () => adminApi.addOrgUnit(user.id, payload));
              }}
            >
              Add scope
            </AdminModalBtn>
          </div>
        </AdminModalSection>
      </div>
      )}
    </AdminModalShell>
  );
}
