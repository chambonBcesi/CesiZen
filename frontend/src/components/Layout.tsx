import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Hop as Home, ChartBar as BarChart3, Settings, User, LogOut, Wind } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-700 transition">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CESIZen</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive('/') ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>

              <Link
                to="/respiration"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive('/respiration') ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Wind className="w-5 h-5" />
                <span className="hidden sm:inline">Respiration</span>
              </Link>

              <Link
                to="/tracker"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive('/tracker') ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Emotions</span>
              </Link>

              {(profile?.role === 'admin' || profile?.role === 'moderator') && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isActive('/admin') ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive('/profile') ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profil</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
