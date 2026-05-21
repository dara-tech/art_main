import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/authRoles';

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="page-shell text-xs text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
