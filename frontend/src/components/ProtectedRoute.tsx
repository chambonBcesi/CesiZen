import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModeratorOrAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireModeratorOrAdmin = false,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/tracker" replace />;
  }

  if (requireModeratorOrAdmin && profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return <Navigate to="/tracker" replace />;
  }

  return <>{children}</>;
}
