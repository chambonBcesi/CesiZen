import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, Profile } from '../lib/api';

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.get<{ user: Profile }>('/api/user/profile');
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const data = await api.post<{ token: string; user: Profile }>('/api/auth/register', {
      email,
      password,
      fullName,
    });
    setToken(data.token);
    setUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: Profile }>('/api/auth/login', {
      email,
      password,
    });
    setToken(data.token);
    setUser(data.user);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
