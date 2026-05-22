import { Outlet } from 'react-router-dom';
import AppPageShell from '../layout/AppPageShell';

export default function QueryLayout() {
  return (
    <AppPageShell>
      <Outlet />
    </AppPageShell>
  );
}
