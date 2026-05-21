import { useEffect, useMemo, useState } from 'react';
import { RiCloseLine, RiDeleteBinLine } from '@remixicon/react';
import { toast } from 'sonner';
import adminApi from '../../services/adminApi';
import AdminScopeFields from './AdminScopeFields';
import { formatOrgUnitLabel } from '../../utils/provinces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function AdminUserEditor({ user, roles, sites, provinces = [], ods = [], onClose, onUpdated }) {
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

  if (!user) return null;

  const isScoped = (user.orgUnits || []).length > 0;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto border border-border/80 bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/50 px-4 py-3">
          <h2 className="text-sm font-semibold">Manage user</h2>
          <Button type="button" size="sm" variant="ghost" className="rounded-none" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-4 text-sm">
          <div>
            <p className="text-lg font-semibold">{user.fullName}</p>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.email ? <p className="text-xs">{user.email}</p> : null}
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Last login</dt>
            <dd>{fmtDate(user.lastLoginAt)}</dd>
          </dl>

          <section className="space-y-2 border border-border/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</p>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              autoComplete="new-password"
              className="rounded-none"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="rounded-none"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none"
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
            </Button>
          </section>

          <section className="space-y-2 border border-border/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account status</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={user.active ? 'default' : 'destructive'} className="rounded-none">
                {user.active ? 'Active' : 'Disabled'}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-none"
                disabled={saving}
                onClick={() =>
                  runAction(user.active ? 'User disabled' : 'User activated', () =>
                    adminApi.updateUserStatus(user.id, !user.active)
                  )
                }
              >
                {user.active ? 'Disable account' : 'Enable account'}
              </Button>
            </div>
          </section>

          <section className="space-y-2 border border-border/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roles</p>
            <ul className="space-y-2">
              {(user.roles || []).map((r) => (
                <li key={r.assignmentId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-none">{r.name}</Badge>
                    <code className="text-[11px] text-muted-foreground">{r.slug}</code>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-none text-destructive"
                    disabled={saving}
                    onClick={() =>
                      runAction('Role removed', () => adminApi.removeRole(user.id, r.assignmentId))
                    }
                  >
                    <RiDeleteBinLine className="size-4" />
                  </Button>
                </li>
              ))}
              {!user.roles?.length ? (
                <p className="text-xs text-muted-foreground">No roles — user is Guest.</p>
              ) : null}
            </ul>
            {availableRoles.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <select
                  value={addRoleId}
                  onChange={(e) => setAddRoleId(e.target.value)}
                  className="h-9 min-w-[160px] flex-1 border border-border/80 bg-background px-2 text-sm"
                >
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-none"
                  disabled={saving || !addRoleId}
                  onClick={() =>
                    runAction('Role assigned', () => adminApi.assignRole(user.id, Number(addRoleId)))
                  }
                >
                  Add role
                </Button>
              </div>
            ) : null}
          </section>

          <section className="space-y-2 border border-border/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Site access</p>
            <p className="text-xs text-muted-foreground">
              {isScoped
                ? 'Scoped to specific sites / provinces / ODs via user_org_units.'
                : 'No scope rows — user can access all sites.'}
            </p>

            {user.assignedSites?.length ? (
              <p className="text-xs">
                <span className="font-medium">Facilities:</span> {user.assignedSites.join(', ')}
              </p>
            ) : null}

            <ul className="space-y-2">
              {(user.orgUnits || []).map((unit) => (
                <li
                  key={unit.id}
                  className="flex items-center justify-between gap-2 border border-border/60 bg-muted/20 px-2 py-1.5 text-xs"
                >
                  <span>{formatOrgUnitLabel(unit)}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-none text-destructive"
                    disabled={saving}
                    onClick={() =>
                      runAction('Scope removed', () => adminApi.removeOrgUnit(user.id, unit.id))
                    }
                  >
                    <RiDeleteBinLine className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-none"
                disabled={saving || !isScoped}
                onClick={() =>
                  runAction('All sites access restored', () => adminApi.clearOrgUnits(user.id))
                }
              >
                Allow all sites
              </Button>
            </div>

            <div className="space-y-2 border-t border-border/80 pt-3">
              <p className="text-xs font-medium">Add scope</p>
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
              <Button
                type="button"
                size="sm"
                className="rounded-none"
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
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
