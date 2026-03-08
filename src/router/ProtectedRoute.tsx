import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { ReactNode } from 'react';

export function ProtectedRoute({ children, requiredPermission }: { children: ReactNode; requiredPermission?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { canCreate, canView } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if route requires specific create permission
  if (requiredPermission) {
    if (!canCreate(requiredPermission)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
