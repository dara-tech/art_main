import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
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
  p360ControlClass,
  vizKpiCardClass
} from '../components/layout/appNavStyles';

const adminUserCellClass = cn(
  P360_TABLE_PAD,
  'flex min-h-8 min-w-0 flex-col justify-center gap-0.5 py-1.5',
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

  const roleRows = useMemo(() => stats?.roleBreakdown || [], [stats]);

  const roleTableColumns = useMemo(
    () => [
      { id: 'id', label: 'ID', width: 56, mono: true, getValue: (r) => r.id },
      { id: 'name', label: 'Role', width: 160, getValue: (r) => r.name },
      {
        id: 'slug',
        label: 'Slug',
        width: 140,
        mono: true,
        getValue: (r) => r.slug
      },
      {
        id: 'count',
        label: 'Users',
        width: 72,
        mono: true,
        getValue: (r) => {
          const count = roleRows.find((x) => x.id === r.id)?.userCount ?? 0;
          return count.toLocaleString('km-KH');
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
        label: 'User',
        width: 180,
        getValue: (r) => r.fullName,
        renderCell: (row, text) => (
          <div className={adminUserCellClass}>
            <button
              type="button"
              className="truncate text-left font-medium text-primary underline-offset-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                openUserEditor(row);
              }}
            >
              {text}
            </button>
            {row.username ? (
              <div className="truncate font-mono text-[10px] text-muted-foreground">{row.username}</div>
            ) : null}
          </div>
        )
      },
      {
        id: 'roles',
        label: 'Roles',
        width: 160,
        getValue: (r) => (r.roleNames?.length ? r.roleNames.join(', ') : 'Guest'),
        renderCell: (row) => (
          <span className={cn(P360_TABLE_BODY_ROW_INNER, 'truncate')}>
            {row.roleNames?.length ? row.roleNames.join(', ') : (
              <span className="text-muted-foreground">Guest</span>
            )}
          </span>
        )
      },
      {
        id: 'site',
        label: 'Site access',
        width: 120,
        getValue: (r) =>
          r.siteAccess === 'scoped' ? `Scoped (${r.orgUnitCount})` : 'All sites'
      },
      {
        id: 'status',
        label: 'Status',
        width: 88,
        getValue: (r) => (r.active ? 'Active' : 'Disabled'),
        renderCell: (row, text) => (
          <span
            className={cn(
              P360_TABLE_BODY_ROW_INNER,
              row.active ? 'text-emerald-800 dark:text-emerald-400' : 'text-destructive'
            )}
          >
            {text}
          </span>
        )
      }
    ],
    [openUserEditor]
  );

  const userTableRows = useMemo(
    () => users.map((u) => ({ ...u, _key: String(u.id) })),
    [users]
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
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col p-0">
              {loading && !stats ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/35 backdrop-blur-[3px]">
                  <Patient360LoadingPanel label="Loading…" className="border-0 bg-transparent" minHeight="min-h-0" />
                </div>
              ) : null}

              <div className="flex min-h-0 flex-1 flex-col">
                {stats ? (
                  <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-border/80 bg-muted/10 px-5 py-2 sm:grid-cols-4">
                    <div className={vizKpiCardClass}>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>Total users</p>
                      <p className="text-base font-semibold tabular-nums leading-tight text-foreground">
                        {Number(stats.totalUsers).toLocaleString('km-KH')}
                      </p>
                    </div>
                    <div className={vizKpiCardClass}>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>Active users</p>
                      <p className="text-base font-semibold tabular-nums leading-tight text-foreground">
                        {Number(stats.activeUsers).toLocaleString('km-KH')}
                      </p>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
                        {stats.usersWithRoles} with roles
                      </p>
                    </div>
                    <div className={vizKpiCardClass}>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>Site scoped</p>
                      <p className="text-base font-semibold tabular-nums leading-tight text-foreground">
                        {Number(stats.usersWithScope).toLocaleString('km-KH')}
                      </p>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
                        {stats.orgUnitRows} org unit rows
                      </p>
                    </div>
                    <div className={vizKpiCardClass}>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>Role types</p>
                      <p className="text-base font-semibold tabular-nums leading-tight text-foreground">
                        {Number(stats.totalRoles).toLocaleString('km-KH')}
                      </p>
                      <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
                        {stats.roleAssignments} assignments
                      </p>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className={cn('shrink-0 border-b border-destructive/30 bg-destructive/10 px-5 py-2 text-destructive', P360_TABLE_TEXT)}>
                    {error}
                  </p>
                ) : null}

                {tab === 'users' ? (
                  <>
                    <form
                      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 bg-muted/10 px-5 py-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setSearch(searchInput.trim());
                      }}
                    >
                      <div className="relative min-h-8 min-w-[12rem] flex-1">
                        <RiSearchLine
                          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <input
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Search username, name, email…"
                          className={cn(adminControlClass, 'h-8 w-full pl-8')}
                        />
                      </div>
                      <button type="submit" className={cn(p360ControlClass, 'h-8 shrink-0 px-3')}>
                        Search
                      </button>
                      {search ? (
                        <button
                          type="button"
                          className={cn(p360ControlClass, 'h-8 shrink-0 px-3')}
                          onClick={() => {
                            setSearchInput('');
                            setSearch('');
                            setPage(1);
                          }}
                        >
                          Clear
                        </button>
                      ) : null}
                    </form>

                    <div className="relative min-h-0 flex-1 overflow-hidden px-5 pb-2 pt-2">
                      {usersLoading ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
                          <Patient360LoadingPanel label="Loading users…" className="border-0 bg-transparent" minHeight="min-h-0" />
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
                        emptyMessage="No users found."
                        onRowClick={(row) => openUserEditor(row)}
                      />
                    </div>

                    <div
                      className={cn(
                        'flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-muted/10 px-5 py-2 text-muted-foreground',
                        P360_TABLE_TEXT
                      )}
                    >
                      <span className="tabular-nums">
                        Page {page} of {totalPages} · {total.toLocaleString('km-KH')} users
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={cn(p360ControlClass, 'h-7 px-2.5')}
                          disabled={page <= 1 || usersLoading}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className={cn(p360ControlClass, 'h-7 px-2.5')}
                          disabled={page >= totalPages || usersLoading}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {tab === 'roles' ? (
                  <div className="min-h-0 flex-1 overflow-hidden px-5 py-2">
                    <Patient360DataTable
                      columns={roleTableColumns}
                      rows={roleTableRows}
                      getRowKey={(r) => r._key}
                      scrollBody
                      fillHeight
                      stickyHeader
                      compactBodyRows
                      className="h-full min-h-[12rem] flex-1 border border-border/80 shadow-sm"
                      emptyMessage="No roles."
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
