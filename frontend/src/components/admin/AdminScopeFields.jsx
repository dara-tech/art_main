import { getProvinceName } from '../../utils/provinces';

/**
 * Shared scope picker: facility, province, or OD.
 */
export default function AdminScopeFields({
  scopeType,
  onScopeTypeChange,
  siteId,
  onSiteIdChange,
  provinceId,
  onProvinceIdChange,
  odCode,
  onOdCodeChange,
  sites = [],
  provinces = [],
  ods = [],
  hideTypeSelect = false
}) {
  return (
    <div className="space-y-2">
      {!hideTypeSelect ? (
        <select
          value={scopeType}
          onChange={(e) => onScopeTypeChange(e.target.value)}
          className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
        >
          <option value="site">Single facility</option>
          <option value="province">Whole province</option>
          <option value="od">Operational district (OD)</option>
        </select>
      ) : null}

      {scopeType === 'site' ? (
        <select
          value={siteId}
          onChange={(e) => onSiteIdChange(e.target.value)}
          className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
        >
          {(sites || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
      ) : null}

      {scopeType === 'province' ? (
        <select
          value={provinceId}
          onChange={(e) => onProvinceIdChange(e.target.value)}
          className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
        >
          {(provinces || []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || getProvinceName(p.id)} ({p.siteCount ?? 0} sites)
            </option>
          ))}
        </select>
      ) : null}

      {scopeType === 'od' ? (
        <select
          value={odCode}
          onChange={(e) => onOdCodeChange(e.target.value)}
          className="h-9 w-full border border-border/80 bg-background px-2 text-sm"
        >
          {(ods || []).map((o) => (
            <option key={o.code} value={o.code}>
              {o.code} ({o.siteCount ?? 0} sites)
            </option>
          ))}
        </select>
      ) : null}

      {scopeType === 'province' ? (
        <p className="text-[11px] text-muted-foreground">
          User can run reports and DQA for all facilities in this province.
        </p>
      ) : null}
    </div>
  );
}
