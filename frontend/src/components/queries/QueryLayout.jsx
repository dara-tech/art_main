import { Outlet } from 'react-router-dom';
import AppPageShell from '../layout/AppPageShell';

export default function QueryLayout({ onLogout }) {
  return (
    <AppPageShell onLogout={onLogout}>
      <Outlet />
    </AppPageShell>
  );
}
