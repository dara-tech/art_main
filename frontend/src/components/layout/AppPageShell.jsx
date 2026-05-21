import AppNavActions from './AppNavActions';

/**
 * Fixed top-right actions shared across secondary pages (API, Queries, DQA, Admin).
 */
export default function AppPageShell({ onLogout, children, showBackToReports = true }) {
  return (
    <div className="mx-auto min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-6 lg:max-w-[300mm]">
      <AppNavActions onLogout={onLogout} showBackToReports={showBackToReports} />
      {children}
    </div>
  );
}
