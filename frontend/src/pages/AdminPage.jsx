import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiRefreshLine, RiSearchLine, RiUserSettingsLine } from '@remixicon/react';
import AppPageShell from '../components/layout/AppPageShell';
import AdminCreateUser from '../components/admin/AdminCreateUser';
import AdminUserEditor from '../components/admin/AdminUserEditor';
import adminApi from '../services/adminApi';
import { getProvinceName } from '../utils/provinces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

function StatCard({ label, value, hint }) {
  return (
    <div className="border border-border/80 bg-card px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function AdminPage({ onLogout }) {
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
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

  const openUserDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.getUser(userId);
      setSelectedUser(res.user);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load user');
    } finally {
      setDetailLoading(false);
    }
  };

  const roleRows = useMemo(() => stats?.roleBreakdown || [], [stats]);

  return (
    <AppPageShell>
      <Card className="rounded-none border-border/80 py-0 shadow-xl shadow-black/6 gap-0 overflow-hidden">
        <div className="h-1.5 w-full bg-violet-600" />
        <CardHeader className="border-b border-border/80 bg-muted/65 px-4 pb-3 pt-4">
          <CardTitle className="inline-flex items-center gap-2">
            <RiUserSettingsLine className="size-5 text-violet-700" />
            Admin panel
          </CardTitle>
          <CardDescription className="mt-1">
            Create users, reset passwords, and manage roles and site scope.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={tab === 'users' ? 'default' : 'outline'}
              className="rounded-none"
              onClick={() => setTab('users')}
            >
              Users
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === 'roles' ? 'default' : 'outline'}
              className="rounded-none"
              onClick={() => setTab('roles')}
            >
              Roles
            </Button>
            {tab === 'users' ? (
              <Button
                type="button"
                size="sm"
                className="ml-auto rounded-none"
                onClick={() => setShowCreateUser(true)}
              >
                Create user
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`rounded-none ${tab !== 'users' ? 'ml-auto' : ''}`}
              onClick={() => {
                loadMeta();
                if (tab === 'users') loadUsers();
              }}
            >
              <RiRefreshLine className="size-4" />
              Refresh
            </Button>
          </div>

          {loading && !stats ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}

          {stats ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total users" value={stats.totalUsers} />
              <StatCard label="Active users" value={stats.activeUsers} hint={`${stats.usersWithRoles} with roles`} />
              <StatCard label="Site scoped" value={stats.usersWithScope} hint={`${stats.orgUnitRows} org unit rows`} />
              <StatCard label="Role types" value={stats.totalRoles} hint={`${stats.roleAssignments} assignments`} />
            </div>
          ) : null}

          {error ? (
            <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {tab === 'roles' ? (
            <div className="overflow-auto border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-14">ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    const count = roleRows.find((r) => r.id === role.id)?.userCount ?? 0;
                    return (
                      <TableRow key={role.id}>
                        <TableCell className="tabular-nums">{role.id}</TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <code className="text-xs">{role.slug}</code>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {tab === 'users' ? (
            <div className="space-y-3">
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setSearch(searchInput.trim());
                }}
              >
                <div className="relative min-w-[220px] flex-1">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search username, name, email…"
                    className="rounded-none pl-9"
                  />
                </div>
                <Button type="submit" className="h-8 rounded-none px-3">
                  Search
                </Button>
                {search ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-none px-3"
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                      setPage(1);
                    }}
                  >
                    Clear
                  </Button>
                ) : null}
              </form>

              <div className="overflow-auto border border-border/80">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14">ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Site access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-28" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Loading users…
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="tabular-nums">{u.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.username}</div>
                          </TableCell>
                          <TableCell>
                            {u.roleNames?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {u.roleNames.map((name) => (
                                  <Badge key={name} variant="secondary" className="rounded-none">
                                    {name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Guest (none assigned)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {u.siteAccess === 'scoped' ? (
                              <Badge variant="outline" className="rounded-none">
                                Scoped ({u.orgUnitCount})
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="rounded-none">
                                All sites
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.active ? 'default' : 'destructive'} className="rounded-none">
                              {u.active ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="rounded-none"
                              onClick={() => openUserDetail(u.id)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Page {page} of {totalPages} · {total} users
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    disabled={page <= 1 || usersLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    disabled={page >= totalPages || usersLoading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {detailLoading && !selectedUser ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 text-sm text-white">
          Loading user…
        </div>
      ) : null}
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
            openUserDetail(user.id);
          }}
        />
      ) : null}
      {selectedUser ? (
        <AdminUserEditor
          user={selectedUser}
          roles={roles}
          sites={sites}
          provinces={provinces}
          ods={ods}
          onClose={() => setSelectedUser(null)}
          onUpdated={(updated) => {
            setSelectedUser(updated);
            loadUsers();
            loadMeta();
          }}
        />
      ) : null}
    </AppPageShell>
  );
}
