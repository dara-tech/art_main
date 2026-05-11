import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext.jsx';
import DocumentPage from './pages/DocumentPage.jsx';
import IndicatorDetailsPage from './pages/IndicatorDetailsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import QueryReferencePage from './pages/QueryReferencePage.jsx';
import ReportHomePage from './pages/ReportHomePage.jsx';

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
    return <div className="page-shell text-xs text-muted-foreground">Loading…</div>;
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
    <>
      <Routes>
        <Route path="/" element={<ReportHomePage onLogout={logout} />} />
        <Route path="/documents" element={<DocumentPage onLogout={logout} />} />
        <Route path="/queries" element={<QueryReferencePage onLogout={logout} />} />
        <Route path="/details/:indicatorId" element={<IndicatorDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster {...toasterProps} />
    </>
  );
}

export default App;
