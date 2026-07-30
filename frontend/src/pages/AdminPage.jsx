import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RiSearchLine,
  RiUserLine,
  RiShieldUserLine,
  RiBuildingLine,
  RiCheckLine,
  RiCloseLine,
  RiUserAddLine,
  RiFilter3Line,
  RiRefreshLine,
  RiEditLine,
  RiShieldCheckLine
} from '@remixicon/react';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import Patient360DataTable from '../components/patient360/Patient360DataTable';
import { Patient360LoadingPanel } from '../components/patient360/Patient360LoadingPanel';
import AdminCreateUser from '../components/admin/AdminCreateUser';
import AdminUserEditor from '../components/admin/AdminUserEditor';
import AdminToolbar, { adminControlClass } from '../components/admin/AdminToolbar';
import adminApi from '../services/adminApi';
import { getProvinceName } from '../utils/provinces';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  P360_TABLE_BODY_ROW_INNER,
  P360_TABLE_PAD,
  P360_TABLE_TEXT,
  p360CardClass,
  p360ControlClass
} from '../components/layout/appNavStyles';

const adminUserCellClass = cn(
  P360_TABLE_PAD,
  'flex min-h-10 min-w-0 flex-col justify-center gap-0.5 py-1.5 font-khmer',
  P360_TABLE_TEXT
);

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [roles, setRoles] = useState([]);
  const [sites, setSites] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [ods, setOds] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'disabled'
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEditor, setUserEditor] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const limit = 25;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loadMeta = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, rolesRes, sitesRes, provincesRes, odsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRoles(),
        adminApi.getSites(),
        adminApi.getProvinces(),
        adminApi.getOds()
      ]);
      setStats(statsRes.stats);
      setRoles(rolesRes.roles || []);
      setSites(sitesRes.sites || []);
      setProvinces(
        (provincesRes.provinces || []).map((p) => ({
          ...p,
          name: getProvinceName(p.id)
        }))
      );
      setOds(odsRes.ods || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setError('');
    try {
      const res = await adminApi.listUsers({ page, limit, search });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
  }, [tab, loadUsers]);

  const closeUserEditor = useCallback(() => setUserEditor(null), []);

  const openUserEditor = useCallback(async (row) => {
    const userId = row?.id ?? row;
    const preview =
      row && typeof row === 'object'
        ? row
        : users.find((u) => u.id === userId) || { id: userId, fullName: 'User', username: '' };

    setUserEditor({ userId, preview, user: null, loading: true, error: '' });

    try {
      const res = await adminApi.getUser(userId);
      setUserEditor((prev) => {
        if (!prev || prev.userId !== userId) return prev;
        return { ...prev, user: res.user, loading: false, error: '' };
      });
    } catch (e) {
      const message = e.response?.data?.message || e.message || 'Failed to load user';
      setUserEditor((prev) => {
        if (!prev || prev.userId !== userId) return prev;
        return { ...prev, loading: false, error: message };
      });
    }
  }, [users]);

  // Client-side Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === 'active' && !u.active) return false;
      if (statusFilter === 'disabled' && u.active) return false;
      if (roleFilter !== 'all') {
        const hasRole = u.roleNames?.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase()));
        if (!hasRole) return false;
      }
      return true;
    });
  }, [users, statusFilter, roleFilter]);

  const roleRows = useMemo(() => stats?.roleBreakdown || [], [stats]);

  const roleTableColumns = useMemo(
    () => [
      { id: 'id', label: 'ID', width: 56, mono: true, getValue: (r) => r.id },
      { id: 'name', label: 'ឈ្មោះ Role', width: 180, getValue: (r) => r.name },
      {
        id: 'slug',
        label: 'Slug Code',
        width: 140,
        mono: true,
        getValue: (r) => r.slug
      },
      {
        id: 'count',
        label: 'ចំនួនអ្នកប្រើប្រាស់',
        width: 120,
        mono: true,
        getValue: (r) => {
          const count = roleRows.find((x) => x.id === r.id)?.userCount ?? 0;
          return count.toLocaleString('km-KH');
        },
        renderCell: (row) => {
          const count = roleRows.find((x) => x.id === row.id)?.userCount ?? 0;
          return (
            <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 border border-primary/20">
              {count.toLocaleString()} Users
            </span>
          );
        }
      }
    ],
    [roleRows]
  );

  const userTableColumns = useMemo(
    () => [
      { id: 'id', label: 'ID', width: 56, mono: true, getValue: (r) => r.id },
      {
        id: 'user',
        label: 'អ្នកប្រើប្រាស់ (User)',
        width: 220,
        getValue: (r) => r.fullName,
        renderCell: (row, text) => {
          const initials = (text || row.username || 'U')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div className={adminUserCellClass}>
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-7 shrink-0 items-center justify-center bg-primary/15 text-primary text-[10px] font-black border border-primary/30">
                  {initials}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-background',
                      row.active ? 'bg-emerald-500' : 'bg-rose-500'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="truncate text-left font-bold text-xs text-foreground hover:text-primary hover:underline transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUserEditor(row);
                    }}
                  >
                    {text || row.username}
                  </button>
                  {row.username ? (
                    <div className="truncate font-mono text-[10px] text-muted-foreground">@{row.username}</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        id: 'roles',
        label: 'តួនាទី (Roles)',
        width: 180,
        getValue: (r) => (r.roleNames?.length ? r.roleNames.join(', ') : 'Guest'),
        renderCell: (row) => (
          <div className="flex flex-wrap gap-1 py-1 font-khmer">
            {row.roleNames?.length ? (
              row.roleNames.map((rn) => (
                <span
                  key={rn}
                  className="inline-block text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {rn}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5">Guest</span>
            )}
          </div>
        )
      },
      {
        id: 'site',
        label: 'សិទ្ធិចូលមើល (Site Access)',
        width: 160,
        getValue: (r) =>
          r.siteAccess === 'scoped' ? `Scoped (${r.orgUnitCount})` : 'All sites',
        renderCell: (row) => (
          <span className="font-khmer">
            {row.siteAccess === 'scoped' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                <RiBuildingLine className="size-3" />
                Scoped ({row.orgUnitCount || 1} Sites)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                <RiShieldCheckLine className="size-3" />
                All Sites (National)
              </span>
            )}
          </span>
        )
      },
      {
        id: 'status',
        label: 'ស្ថានភាព',
        width: 110,
        getValue: (r) => (r.active ? 'Active' : 'Disabled'),
        renderCell: (row) => (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 border font-khmer',
              row.active
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            )}
          >
            {row.active ? (
              <>
                <RiCheckLine className="size-3" /> សកម្ម (Active)
              </>
            ) : (
              <>
                <RiCloseLine className="size-3" /> បិទ (Disabled)
              </>
            )}
          </span>
        )
      },
      {
        id: 'actions',
        label: 'សកម្មភាព',
        width: 90,
        getValue: () => '',
        renderCell: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openUserEditor(row);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all cursor-pointer"
          >
            <RiEditLine className="size-3" /> កែប្រែ
          </button>
        )
      }
    ],
    [openUserEditor]
  );

  const userTableRows = useMemo(
    () => filteredUsers.map((u) => ({ ...u, _key: String(u.id) })),
    [filteredUsers]
  );

  const roleTableRows = useMemo(
    () => roles.map((r) => ({ ...r, _key: String(r.id) })),
    [roles]
  );

  const handleRefresh = () => {
    loadMeta();
    if (tab === 'users') loadUsers();
  };

  return (
    <>
      <AdminToolbar
        tab={tab}
        onTabChange={setTab}
        onRefresh={handleRefresh}
        onCreateUser={() => setShowCreateUser(true)}
        loading={loading || usersLoading}
      />

      <Patient360Layout lockViewport>
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0 font-khmer">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card rounded-none border-0')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col p-0">
              {loading && !stats ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/35 backdrop-blur-[3px]">
                  <Patient360LoadingPanel label="កំពុងផ្ទុកទិន្នន័យ Admin..." className="border-0 bg-transparent" minHeight="min-h-0" />
                </div>
              ) : null}

              <div className="flex min-h-0 flex-1 flex-col space-y-0">
                {/* EXECUTIVE STATS KPI CARDS HEADER */}
                {stats ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-border/80 bg-muted/20">
                    {/* KPI 1: Total Users */}
                    <div className="border border-border/80 bg-card p-3 shadow-2xs space-y-1 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          អ្នកប្រើប្រាស់សរុប (Total Users)
                        </p>
                        <p className="text-lg font-black text-foreground tabular-nums">
                          {Number(stats.totalUsers).toLocaleString('km-KH')} <span className="text-xs font-bold text-muted-foreground">នាក់</span>
                        </p>
                      </div>
                      <div className="p-2.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                        <RiUserLine className="size-5" />
                      </div>
                    </div>

                    {/* KPI 2: Active Accounts */}
                    <div className="border border-border/80 bg-card p-3 shadow-2xs space-y-1 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          គណនីសកម្ម (Active Accounts)
                        </p>
                        <p className="text-lg font-black text-emerald-400 tabular-nums">
                          {Number(stats.activeUsers).toLocaleString('km-KH')} <span className="text-xs font-bold text-emerald-300">({Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}%)</span>
                        </p>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                        <RiShieldUserLine className="size-5" />
                      </div>
                    </div>

                    {/* KPI 3: Site Scoped Users */}
                    <div className="border border-border/80 bg-card p-3 shadow-2xs space-y-1 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          សិទ្ធិមន្ទីរពេទ្យ (Scoped Sites)
                        </p>
                        <p className="text-lg font-black text-amber-400 tabular-nums">
                          {Number(stats.usersWithScope).toLocaleString('km-KH')} <span className="text-xs font-bold text-muted-foreground">អ្នកប្រើ</span>
                        </p>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                        <RiBuildingLine className="size-5" />
                      </div>
                    </div>

                    {/* KPI 4: Role Definitions */}
                    <div className="border border-border/80 bg-card p-3 shadow-2xs space-y-1 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          ប្រភេទតួនាទី (Role Definitions)
                        </p>
                        <p className="text-lg font-black text-purple-400 tabular-nums">
                          {Number(stats.totalRoles).toLocaleString('km-KH')} <span className="text-xs font-bold text-purple-300">Roles</span>
                        </p>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
                        <RiShieldCheckLine className="size-5" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className={cn('shrink-0 border-b border-destructive/30 bg-destructive/10 px-5 py-2 text-destructive font-khmer text-xs', P360_TABLE_TEXT)}>
                    {error}
                  </p>
                ) : null}

                {tab === 'users' ? (
                  <>
                    {/* ADVANCED MULTI-FILTER TOOLBAR */}
                    <form
                      className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/10 px-4 py-2 font-khmer"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setSearch(searchInput.trim());
                      }}
                    >
                      <div className="flex flex-1 items-center gap-2 min-w-[280px]">
                        <div className="relative flex-1">
                          <RiSearchLine
                            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="ស្វែងរកឈ្មោះ, Username, Email ឬ Code…"
                            className="h-8 w-full border border-border bg-background pl-8 pr-3 text-xs font-khmer text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          ស្វែងរក
                        </button>
                        {search ? (
                          <button
                            type="button"
                            className="h-8 px-3 text-xs font-bold bg-muted text-muted-foreground hover:text-foreground border border-border transition-all cursor-pointer shrink-0 shadow-2xs"
                            onClick={() => {
                              setSearchInput('');
                              setSearch('');
                              setPage(1);
                            }}
                          >
                            លុប
                          </button>
                        ) : null}
                      </div>

                      {/* QUICK FILTER DROPDOWNS & ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Filter */}
                        <div className="h-8 flex items-center gap-1.5 bg-background border border-border px-2.5 text-xs font-bold text-foreground shadow-2xs">
                          <RiFilter3Line className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground text-[11px] shrink-0">ស្ថានភាព ៖</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-foreground h-full"
                          >
                            <option value="all">ទាំងអស់ (All Status)</option>
                            <option value="active">សកម្ម (Active)</option>
                            <option value="disabled">បិទ (Disabled)</option>
                          </select>
                        </div>

                        {/* Role Filter */}
                        <div className="h-8 flex items-center gap-1.5 bg-background border border-border px-2.5 text-xs font-bold text-foreground shadow-2xs">
                          <span className="text-muted-foreground text-[11px] shrink-0">តួនាទី ៖</span>
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-foreground h-full"
                          >
                            <option value="all">គ្រប់ Roles (All Roles)</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.slug || r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Create User Button */}
                        <button
                          type="button"
                          onClick={() => setShowCreateUser(true)}
                          className="h-8 flex items-center gap-1.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-2xs transition-all cursor-pointer shrink-0"
                        >
                          <RiUserAddLine className="size-3.5 shrink-0" />
                          <span>បង្កើតគណនីថ្មី</span>
                        </button>
                      </div>
                    </form>

                    {/* USERS DATA TABLE CONTAINER */}
                    <div className="relative min-h-0 flex-1 overflow-hidden px-4 pb-2 pt-2">
                      {usersLoading ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
                          <Patient360LoadingPanel label="កំពុងផ្ទុកបញ្ជីអ្នកប្រើប្រាស់…" className="border-0 bg-transparent" minHeight="min-h-0" />
                        </div>
                      ) : null}
                      <Patient360DataTable
                        columns={userTableColumns}
                        rows={userTableRows}
                        getRowKey={(r) => r._key}
                        scrollBody
                        fillHeight
                        stickyHeader
                        className="h-full min-h-0 flex-1 border border-border/80 shadow-sm"
                        emptyMessage="មិនមានអ្នកប្រើប្រាស់ត្រូវបានស្វែងរកឃើញទេ។"
                        onRowClick={(row) => openUserEditor(row)}
                      />
                    </div>

                    {/* PAGINATION FOOTER */}
                    <div
                      className={cn(
                        'flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-muted/10 px-5 py-2.5 text-muted-foreground font-khmer',
                        P360_TABLE_TEXT
                      )}
                    >
                      <span className="tabular-nums font-bold text-xs">
                        ទំព័រ {page} នៃ {totalPages} · សរុប {total.toLocaleString('km-KH')} គណនី
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={cn(p360ControlClass, 'h-7 px-3 text-xs font-bold')}
                          disabled={page <= 1 || usersLoading}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          ទំព័រមុន (Prev)
                        </button>
                        <button
                          type="button"
                          className={cn(p360ControlClass, 'h-7 px-3 text-xs font-bold')}
                          disabled={page >= totalPages || usersLoading}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          ទំព័របន្ទាប់ (Next)
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {tab === 'roles' ? (
                  <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 font-khmer">
                    <Patient360DataTable
                      columns={roleTableColumns}
                      rows={roleTableRows}
                      getRowKey={(r) => r._key}
                      scrollBody
                      fillHeight
                      stickyHeader
                      compactBodyRows
                      className="h-full min-h-[12rem] flex-1 border border-border/80 shadow-sm"
                      emptyMessage="មិនទាន់មាន Roles ក្នុងប្រព័ន្ធនៅឡើយទេ។"
                    />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>

      {showCreateUser ? (
        <AdminCreateUser
          roles={roles}
          sites={sites}
          provinces={provinces}
          ods={ods}
          onClose={() => setShowCreateUser(false)}
          onCreated={(user) => {
            loadUsers();
            loadMeta();
            openUserEditor(user);
          }}
        />
      ) : null}

      {userEditor ? (
        <AdminUserEditor
          preview={userEditor.preview}
          user={userEditor.user}
          loading={userEditor.loading}
          error={userEditor.error}
          roles={roles}
          sites={sites}
          provinces={provinces}
          ods={ods}
          onClose={closeUserEditor}
          onUpdated={(updated) => {
            setUserEditor((prev) =>
              prev ? { ...prev, user: updated, preview: { ...prev.preview, ...updated } } : prev
            );
            loadUsers();
            loadMeta();
          }}
        />
      ) : null}
    </>
  );
}
