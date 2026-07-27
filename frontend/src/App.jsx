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
import DashboardPage from './pages/DashboardPage.jsx';
import ReportHomePage from './pages/ReportHomePage.jsx';

const DocumentPage = lazy(() => import('./pages/DocumentPage.jsx'));
const IndicatorDetailsPage = lazy(() => import('./pages/IndicatorDetailsPage.jsx'));
const DqaPage = lazy(() => import('./pages/DqaPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const RequireAdmin = lazy(() => import('./components/auth/RequireAdmin.jsx'));
const CountryAnalyticsPage = lazy(() => import('./pages/CountryAnalyticsPage.jsx'));
const ClinicalFormsListPage = lazy(() => import('./pages/ClinicalFormsListPage.jsx'));
const PatientRegistrationPage = lazy(() => import('./pages/PatientRegistrationPage.jsx'));
const PatientVisitPage = lazy(() => import('./pages/PatientVisitPage.jsx'));

import { isGuest, hasRole } from './utils/authRoles.js';

function RequireNotGuest({ children }) {
  const { user } = useAuth();
  if (isGuest(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RequireNotGuestOrPdmo({ children }) {
  const { user } = useAuth();
  if (isGuest(user) || hasRole(user, 'pdmo')) {
    return <Navigate to="/dashboard" replace />;
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

function GlobalGradients() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary, #f97316)" />
          <stop offset="100%" stopColor="var(--gradient-end, #ec4899)" />
        </linearGradient>
      </defs>
    </svg>
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
        <GlobalGradients />
      </>
    );
  }

  return (
    <SitesProvider>
      <AppLayout onLogout={logout}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage onLogout={logout} />} />
            <Route path="/reports" element={<ReportHomePage onLogout={logout} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/documents" element={<RequireNotGuestOrPdmo><DocumentPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
            <Route path="/dqa" element={<RequireNotGuestOrPdmo><DqaPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
            <Route path="/patient-360" element={<RequireNotGuest><Patient360Page onLogout={logout} /></RequireNotGuest>} />
            
            {/* Clinical Forms Routing */}
            <Route path="/forms/:program" element={<RequireNotGuest><ClinicalFormsListPage /></RequireNotGuest>} />
            <Route path="/forms/:program/:clinicId/intake" element={<RequireNotGuest><PatientRegistrationPage /></RequireNotGuest>} />
            <Route path="/forms/:program/:clinicId/visits" element={<RequireNotGuest><PatientVisitPage /></RequireNotGuest>} />

            <Route path="/country-analytics" element={<RequireNotGuestOrPdmo><CountryAnalyticsPage onLogout={logout} /></RequireNotGuestOrPdmo>} />
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
            <Route path="/details/:indicatorId" element={<IndicatorDetailsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
      <Toaster {...toasterProps} />
      <GlobalGradients />
    </SitesProvider>
  );
}

export default App;
