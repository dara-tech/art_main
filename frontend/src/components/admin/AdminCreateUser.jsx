import { useState } from 'react';
import { toast } from 'sonner';
import adminApi from '../../services/adminApi';
import AdminScopeFields from './AdminScopeFields';
import AdminModalShell, { AdminModalBtn, AdminModalSection } from './AdminModalShell';
import { cn } from '@/lib/utils';
import { P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';

const inputClass = cn(p360ControlClass, 'h-8 w-full');
const labelClass = cn('block space-y-1', P360_TABLE_TEXT);

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
    <AdminModalShell
      asForm
      onSubmit={submit}
      title="Create user"
      description="New account with optional role and site scope."
      onClose={onClose}
      footer={
        <>
          <AdminModalBtn type="button" onClick={onClose}>
            Cancel
          </AdminModalBtn>
          <button type="submit" className={cn(p360ControlClass, 'h-8 border-primary/50 bg-primary/10 px-3')} disabled={saving}>
            {saving ? 'Creating…' : 'Create user'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <label className={labelClass}>
          <span className="text-muted-foreground">Username *</span>
          <input
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            required
            minLength={3}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            <span className="text-muted-foreground">First name</span>
            <input
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span className="text-muted-foreground">Last name</span>
            <input
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          <span className="text-muted-foreground">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className="text-muted-foreground">Password *</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className="text-muted-foreground">Confirm password *</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className="text-muted-foreground">Initial role</span>
          <select
            value={form.roleId}
            onChange={(e) => set('roleId', e.target.value)}
            className={inputClass}
          >
            <option value="">None (Guest)</option>
            {(roles || []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set('active', e.target.checked)}
            className="size-3.5 border border-border accent-primary"
          />
          Account active
        </label>

        <AdminModalSection title="Site access">
          <select
            value={form.accessScope}
            onChange={(e) => set('accessScope', e.target.value)}
            className={inputClass}
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
        </AdminModalSection>
      </div>
    </AdminModalShell>
  );
}
