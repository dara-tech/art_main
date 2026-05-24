import AppNavActions from './AppNavActions';

/** Authenticated shell: fixed compact top bar + scrollable page content below. */
export default function AppLayout({ onLogout, children }) {
  return (
    <>
      <AppNavActions onLogout={onLogout} />
      <div className="min-h-screen bg-card pt-topbar">{children}</div>
    </>
  );
}
