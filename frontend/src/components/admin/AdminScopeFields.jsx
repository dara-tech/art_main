import { cn } from '@/lib/utils';
import { getProvinceName } from '../../utils/provinces';
import { P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';

const selectClass = cn(p360ControlClass, 'h-8 w-full');

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
          className={selectClass}
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
          className={selectClass}
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
          className={selectClass}
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
          className={selectClass}
        >
          {(ods || []).map((o) => (
            <option key={o.code} value={o.code}>
              {o.code} ({o.siteCount ?? 0} sites)
            </option>
          ))}
        </select>
      ) : null}

      {scopeType === 'province' ? (
        <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
          User can run reports and DQA for all facilities in this province.
        </p>
      ) : null}
    </div>
  );
}
