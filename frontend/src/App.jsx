import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext.jsx';
import { SitesProvider } from './contexts/SitesContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import AppPageShell from './components/layout/AppPageShell.jsx';
import { Patient360LoadingPanel } from './components/patient360/Patient360LoadingPanel.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Patient360Page from './pages/Patient360Page.jsx';
import VisualizePage from './pages/VisualizePage.jsx';
import VcctPage from './pages/VcctPage.jsx';
import ReportHomePage from './pages/ReportHomePage.jsx';

const DocumentPage = lazy(() => import('./pages/DocumentPage.jsx'));
const IndicatorDetailsPage = lazy(() => import('./pages/IndicatorDetailsPage.jsx'));
const QueryLayout = lazy(() => import('./components/queries/QueryLayout.jsx'));
const QueryReferencePage = lazy(() => import('./pages/QueryReferencePage.jsx'));
const DqaPage = lazy(() => import('./pages/DqaPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const RequireAdmin = lazy(() => import('./components/auth/RequireAdmin.jsx'));
const CountryAnalyticsPage = lazy(() => import('./pages/CountryAnalyticsPage.jsx'));

import { isGuest, hasRole } from './utils/authRoles.js';

function RequireNotGuest({ children }) {
  const { user } = useAuth();
  if (isGuest(user)) {
    return <Navigate to="/reports" replace />;
  }
  return children;
}

function RequireNotGuestOrPdmo({ children }) {
  const { user } = useAuth();
  if (isGuest(user) || hasRole(user, 'pdmo')) {
    return <Navigate to="/reports" replace />;
  }
  return children;
}

function PageFallback() {
  return (
    <AppPageShell wide>
      <Patient360LoadingPanel label="កំពុងផ្ទុកទំព័រ…" minHeight="min-h-[40vh]" />
    </AppPageShell>
  );
}

function App() {
  const { user, loading, logout } = useAuth();
  const toasterProps = {
    position: 'bottom-right',
    richColors: false,
    toastOptions: {
      classNames: {
        toast: 'border border-border bg-card text-foreground rounded-xl shadow-sm',
        title: 'text-sm font-semibold',
        description: 'text-xs text-muted-foreground',
        actionButton: 'bg-primary text-primary-foreground',
        cancelButton: 'bg-muted text-foreground',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        error: 'border-destructive/30 bg-destructive/10 text-destructive',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        info: 'border-sky-200 bg-sky-50 text-sky-900'
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Patient360LoadingPanel label="កំពុងផ្ទុក…" className="w-full max-w-lg" minHeight="min-h-[12rem]" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster {...toasterProps} />
      </>
    );
  }

  return (
    <SitesProvider>
      <AppLayout onLogout={logout}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/reports" element={<ReportHomePage onLogout={logout} />} />
            <Route path="/" element={<Navigate to="/reports" replace />} />
            <Route path="/documents" element={<RequireNotGuestOrPdmo><DocumentPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
            <Route path="/queries" element={<RequireNotGuestOrPdmo><QueryLayout /></RequireNotGuestOrPdmo>}>
              <Route index element={<QueryReferencePage />} />
            </Route>
            <Route path="/dqa" element={<RequireNotGuestOrPdmo><DqaPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
            <Route path="/patient-360" element={<RequireNotGuest><Patient360Page onLogout={logout} /></RequireNotGuest>} />
            <Route path="/country-analytics" element={<RequireNotGuestOrPdmo><CountryAnalyticsPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
            <Route path="/vcct" element={<RequireNotGuest><VcctPage onLogout={logout} /></RequireNotGuest>} />
            <Route path="/visualize" element={<RequireNotGuest><VisualizePage onLogout={logout} /></RequireNotGuest>} />
            <Route path="/event-report" element={<Navigate to="/visualize" replace />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage onLogout={logout} />
                </RequireAdmin>
              }
            />
            <Route path="/queries/dqa" element={<Navigate to="/dqa" replace />} />
            <Route path="/queries/indicators" element={<Navigate to="/queries" replace />} />
            <Route path="/details/:indicatorId" element={<IndicatorDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
      <Toaster {...toasterProps} />
    </SitesProvider>
  );
}

export default App;
