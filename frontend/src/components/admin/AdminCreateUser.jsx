import { useState } from 'react';
import { RiCloseLine } from '@remixicon/react';
import { toast } from 'sonner';
import adminApi from '../../services/adminApi';
import AdminScopeFields from './AdminScopeFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminCreateUser({ roles, sites, provinces = [], ods = [], onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    roleId: roles?.[0]?.id ? String(roles[0].id) : '',
    active: true,
    accessScope: 'none',
    scopeType: 'site',
    siteId: sites?.[0]?.id ? String(sites[0].id) : '',
    provinceId: provinces?.[0]?.id != null ? String(provinces[0].id) : '',
    odCode: ods?.[0]?.code ? String(ods[0].code) : ''
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        active: form.active
      };
      if (form.roleId) payload.roleId = Number(form.roleId);

      if (form.accessScope !== 'none') {
        if (form.accessScope === 'site') {
          payload.siteId = Number(form.siteId);
        } else {
          payload.orgUnit = {
            scopeType: form.accessScope,
            ...(form.accessScope === 'province' ? { provinceId: Number(form.provinceId) } : {}),
            ...(form.accessScope === 'od' ? { odCode: form.odCode.trim() } : {})
          };
        }
      }

      const res = await adminApi.createUser(payload);
      toast.success('User created');
      onCreated(res.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-lg overflow-auto border border-border/80 bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/50 px-4 py-3">
          <h2 className="text-sm font-semibold">Create user</h2>
          <Button type="button" size="sm" variant="ghost" className="rounded-none" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>

        <div className="space-y-3 p-4 text-sm">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Username *</span>
            <Input
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              required
              minLength={3}
              autoComplete="off"
              className="rounded-none"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">First name</span>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className="rounded-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Last name</span>
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className="rounded-none"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="rounded-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Password *</span>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Confirm password *</span>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Initial role</span>
            <select
              value={form.roleId}
              onChange={(e) => set('roleId', e.target.value)}
              className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
            >
              <option value="">None (Guest)</option>
              {(roles || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
            />
            Account active
          </label>

          <div className="space-y-2 border border-border/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Site access</p>
            <select
              value={form.accessScope}
              onChange={(e) => set('accessScope', e.target.value)}
              className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
            >
              <option value="none">All sites (national)</option>
              <option value="site">One facility</option>
              <option value="province">Whole province</option>
              <option value="od">Operational district (OD)</option>
            </select>
            {form.accessScope !== 'none' ? (
              <AdminScopeFields
                hideTypeSelect
                scopeType={form.accessScope}
                onScopeTypeChange={() => {}}
                siteId={form.siteId}
                onSiteIdChange={(v) => set('siteId', v)}
                provinceId={form.provinceId}
                onProvinceIdChange={(v) => set('provinceId', v)}
                odCode={form.odCode}
                onOdCodeChange={(v) => set('odCode', v)}
                sites={sites}
                provinces={provinces}
                ods={ods}
              />
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/80 bg-muted/30 px-4 py-3">
          <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="rounded-none" disabled={saving}>
            {saving ? 'Creating…' : 'Create user'}
          </Button>
        </div>
      </form>
    </div>
  );
}
