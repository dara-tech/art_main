import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiFileTextLine, RiLogoutBoxRLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Reference for `main_art_new/backend` Express routes (base URL + /apiv1).
 * Update when you add or change routes in server.js / route modules.
 */
export const BACKEND_API_ROUTES = [
  {
    method: 'POST',
    path: '/apiv1/auth/login',
    auth: false,
    description: 'Authenticate user; returns JWT.',
    notes: 'Body: { username, password }'
  },
  {
    method: 'GET',
    path: '/apiv1/auth/verify',
    auth: true,
    description: 'Validate Bearer token and session.',
    notes: 'Header: Authorization: Bearer <token>'
  },
  {
    method: 'GET',
    path: '/apiv1/auth/sites-registry',
    auth: true,
    description: 'Site registry for facility / province / country picker.',
    notes: 'No query params. Header: Authorization: Bearer <token>'
  },
  {
    method: 'GET',
    path: '/apiv1/indicators-optimized/all',
    auth: true,
    description: 'Run all adult/child indicators for a site scope.',
    notes: 'Query: siteCode, siteLevel (country|province|facility), startDate, endDate, previousEndDate'
  },
  {
    method: 'GET',
    path: '/apiv1/indicators-optimized/all/stream',
    auth: true,
    description: 'Same as /all but NDJSON stream (one indicator per line).',
    notes: 'Query: same as /all. Accept: application/x-ndjson'
  },
  {
    method: 'GET',
    path: '/apiv1/indicators-optimized/:indicatorId',
    auth: true,
    description: 'Single indicator aggregate (e.g. 10.8_vl_suppression).',
    notes: 'Query: siteCode, siteLevel, startDate, endDate, previousEndDate'
  },
  {
    method: 'GET',
    path: '/apiv1/indicators-optimized/details/:indicatorId',
    auth: true,
    description: 'Paginated patient-level rows for an indicator.',
    notes: 'Query: siteCode, siteLevel, page, limit, gender?, ageGroup?, dates'
  },
  {
    method: 'GET',
    path: '/apiv1/indicators-optimized/query-reference',
    auth: true,
    description: 'Processed indicator SQL reference with default parameters substituted.',
    notes: 'Optional query: startDate, endDate, previousEndDate (otherwise backend defaults are used)'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/infant-report',
    auth: true,
    description: 'Infant report sections (aggregates).',
    notes: 'Query: siteCode, siteLevel, startDate, endDate, previousEndDate'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/infant-report/stream',
    auth: true,
    description: 'Infant report as NDJSON (one section per line).',
    notes: 'Query: siteCode, siteLevel (country|facility only), dates'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/infant-report/details',
    auth: true,
    description: 'Infant detail SQL rows for a script.',
    notes: 'Query: siteCode, siteLevel, scriptId, dates'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/pntt-report',
    auth: true,
    description: 'PNTT report sections (aggregates).',
    notes: 'Query: siteCode, siteLevel, startDate, endDate, previousEndDate'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/pntt-report/stream',
    auth: true,
    description: 'PNTT report as NDJSON (one section per line).',
    notes: 'Query: siteCode, siteLevel (country|facility only), dates'
  },
  {
    method: 'GET',
    path: '/apiv1/reports/pntt-report/details',
    auth: true,
    description: 'PNTT detail SQL rows for a script.',
    notes: 'Query: siteCode, siteLevel, scriptId, dates'
  }
];

export default function DocumentPage({ onLogout }) {
  const baseHint =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
      : '(set VITE_API_URL in frontend .env)';

  return (
    <div className="min-h-screen bg-background mx-auto lg:max-w-[300mm] px-4 sm:px-6 py-4 sm:py-6">
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onLogout} className="rounded-none bg-card" title="Log out">
          <RiLogoutBoxRLine className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" asChild className="rounded-none bg-card">
          <Link to="/" className="inline-flex items-center justify-center gap-1.5" title="Back to reports">
            <RiArrowLeftLine className="size-4" />
            <span className="text-xs">Reports</span>
          </Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild className="rounded-none bg-card">
          <Link to="/queries" className="inline-flex items-center justify-center gap-1.5" title="Indicator SQL reference">
            <RiFileTextLine className="size-4" />
            <span className="text-xs">Queries</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-none border-border py-0 shadow-sm gap-0 overflow-visible ring-1 ring-[#e0dbd3] dark:ring-stone-600">
        <CardHeader className="border-b border-[#e0dbd3] px-4 pb-3 pt-4 dark:border-stone-600">
          <CardTitle>Backend API</CardTitle>
          <CardDescription className="mt-1">
            Routes mounted in <code className="text-[11px]">server.js</code>. API base:{' '}
            <code className="text-[11px]">{baseHint}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-x border-b border-[#e0dbd3] text-xs dark:border-stone-600">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-[#e0dbd3] bg-[#f9f7f2] text-left dark:border-stone-600 dark:bg-[#2a2826]">
                  <th className="whitespace-nowrap border-r border-[#e0dbd3] bg-[#f9f7f2] px-3 py-2.5 font-semibold text-foreground dark:border-stone-600 dark:bg-[#2a2826]">
                    Method
                  </th>
                  <th className="min-w-[200px] border-r border-[#e0dbd3] bg-[#f9f7f2] px-3 py-2.5 font-semibold text-foreground dark:border-stone-600 dark:bg-[#2a2826]">
                    Path
                  </th>
                  <th className="whitespace-nowrap border-r border-[#e0dbd3] bg-[#f9f7f2] px-3 py-2.5 font-semibold text-foreground dark:border-stone-600 dark:bg-[#2a2826]">
                    Auth
                  </th>
                  <th className="border-r border-[#e0dbd3] bg-[#f9f7f2] px-3 py-2.5 font-semibold text-foreground dark:border-stone-600 dark:bg-[#2a2826]">
                    Description
                  </th>
                  <th className="min-w-[180px] bg-[#f9f7f2] px-3 py-2.5 font-semibold text-foreground dark:bg-[#2a2826]">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {BACKEND_API_ROUTES.map((row) => (
                  <tr
                    key={`${row.method}-${row.path}`}
                    className="border-b border-[#e0dbd3] bg-background hover:bg-[#faf9f6] dark:border-stone-600 dark:hover:bg-stone-900/30"
                  >
                    <td className="whitespace-nowrap border-r border-[#e0dbd3] px-3 py-2 font-mono text-[11px] dark:border-stone-600">
                      {row.method}
                    </td>
                    <td className="border-r border-[#e0dbd3] px-3 py-2 font-mono text-[11px] text-foreground dark:border-stone-600">
                      {row.path}
                    </td>
                    <td className="whitespace-nowrap border-r border-[#e0dbd3] px-3 py-2 dark:border-stone-600">
                      {row.auth ? (
                        <span className="text-amber-800 dark:text-amber-200">Bearer</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="border-r border-[#e0dbd3] px-3 py-2 text-foreground dark:border-stone-600">{row.description}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
