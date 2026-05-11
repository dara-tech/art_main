import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiCodeSSlashLine, RiFileTextLine, RiLogoutBoxRLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../services/api';

export default function QueryReferencePage({ onLogout }) {
  const [queries, setQueries] = useState([]);
  const [paramsUsed, setParamsUsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .get('/apiv1/indicators-optimized/query-reference')
      .then((response) => {
        if (!active) return;
        const nextQueries = Array.isArray(response?.data?.data) ? response.data.data : [];
        setQueries(nextQueries);
        setParamsUsed(response?.data?.paramsUsed || {});
        setExpandedIds(nextQueries[0]?.indicatorId ? [nextQueries[0].indicatorId] : []);
      })
      .catch((e) => {
        if (!active) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load query reference');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredQueries = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return queries;
    return queries.filter((item) => {
      const haystack = [
        item?.indicatorId,
        item?.aggregatePath,
        item?.detailPath,
        item?.aggregateSql,
        item?.detailSql
      ]
        .filter(Boolean)
        .join('\n')
        .toLowerCase();
      return haystack.includes(searchLower);
    });
  }, [queries, search]);

  const toggleExpanded = (indicatorId) => {
    setExpandedIds((prev) =>
      prev.includes(indicatorId) ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId]
    );
  };

  return (
    <div className="mx-auto min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-6 lg:max-w-[300mm]">
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onLogout} className="rounded-none border-border/80 bg-card shadow-sm" title="Log out">
          <RiLogoutBoxRLine className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" asChild className="rounded-none border-border/80 bg-card shadow-sm" title="Back to reports">
          <Link to="/" className="inline-flex items-center justify-center gap-1.5">
            <RiArrowLeftLine className="size-4" />
            <span className="text-xs">Reports</span>
          </Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild className="rounded-none border-border/80 bg-card px-2.5 shadow-sm" title="Backend API reference">
          <Link to="/documents" className="inline-flex items-center justify-center gap-1.5">
            <RiFileTextLine className="size-4" />
            <span className="text-xs">API</span>
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="rounded-none border-border/80 py-0 shadow-xl shadow-black/6 gap-0 overflow-hidden">
          <div className="h-1.5 w-full bg-primary" />
          <CardHeader className="border-b border-border/80 bg-muted/65 px-4 pb-3 pt-4">
            <CardTitle className="inline-flex items-center gap-2">
              <RiCodeSSlashLine className="size-5" />
              Indicator Query Reference
            </CardTitle>
            <CardDescription className="mt-1">
              Processed SQL from `backend/queries/indicators` with backend default parameters already substituted.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by indicator id, path, or SQL text..."
                    className="h-10 w-full rounded-none border border-border/80 bg-background pl-10 pr-3 text-sm shadow-sm"
                  />
                </div>

                {loading ? (
                  <div className="border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">Loading queries…</div>
                ) : error ? (
                  <div className="border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive">{error}</div>
                ) : filteredQueries.length === 0 ? (
                  <div className="border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">No queries found.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredQueries.map((item) => (
                      <div key={item.indicatorId} className="border border-border/80 bg-card shadow-sm">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/20"
                          onClick={() => toggleExpanded(item.indicatorId)}
                        >
                          <span className="min-w-0">
                            <span className="block font-mono text-sm font-semibold text-foreground">{item.indicatorId}</span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.aggregatePath}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-xs text-muted-foreground">{item.detailSql ? 'Aggregate + Detail' : 'Aggregate only'}</span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {(search.trim() || expandedIds.includes(item.indicatorId)) ? 'Hide' : 'Show'}
                            </span>
                          </span>
                        </button>
                        {(search.trim() || expandedIds.includes(item.indicatorId)) && (
                          <div className="border-t border-border/80 px-4 py-4">
                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aggregate SQL</div>
                                <div className="overflow-auto border border-border/80 bg-muted/10 shadow-inner">
                                  <pre className="min-w-max p-4 text-[11px] leading-5 text-foreground">
                                    <code>{item.aggregateSql}</code>
                                  </pre>
                                </div>
                              </div>
                              {item.detailSql ? (
                                <div>
                                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Detail SQL
                                    <span className="ml-2 normal-case text-[11px] text-muted-foreground">{item.detailPath}</span>
                                  </div>
                                  <div className="overflow-auto border border-border/80 bg-muted/10 shadow-inner">
                                    <pre className="min-w-max p-4 text-[11px] leading-5 text-foreground">
                                      <code>{item.detailSql}</code>
                                    </pre>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-auto border border-border/80 bg-muted/15 p-3 shadow-sm lg:sticky lg:top-4 lg:self-start">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parameters Used</div>
                <div className="grid gap-1.5 text-xs">
                  {Object.entries(paramsUsed).map(([key, value]) => (
                    <div key={key} className="border-b border-border/50 pb-1.5 last:border-b-0 last:pb-0">
                      <div className="font-mono text-foreground break-all">{key}</div>
                      <div className="mt-0.5 font-mono text-muted-foreground whitespace-pre-wrap break-all">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
