import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI, setAuthToken, removeAuthToken } from '../services/api';

export interface User {
  id: number;
  email: string;
  username?: string;
  display_name: string;
  avatar_url?: string;
  role: 'ADMIN' | 'USER' | 'VISITOR';
  auth_provider: 'EMAIL' | 'GOOGLE' | 'USERNAME';
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string, verificationCode: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Try to refresh token in background
        refreshToken().catch(() => {
          // If refresh fails, clear user
          setUser(null);
          localStorage.removeItem('user');
          removeAuthToken();
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Admin login with username (legacy)
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.adminLogin(username, password);

      // Save tokens
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Fetch user info
      const userInfo = await authAPI.getCurrentUser();
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  // Email login
  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.emailLogin(email, password);

      // Save tokens
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Fetch user info
      const userInfo = await authAPI.getCurrentUser();
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      return true;
    } catch (error) {
      console.error('Email login failed:', error);
      return false;
    }
  };

  // Register new user
  const register = async (
    email: string,
    password: string,
    displayName: string,
    verificationCode: string
  ): Promise<boolean> => {
    try {
      const response = await authAPI.register(email, password, displayName, verificationCode);

      // Save tokens
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Fetch user info
      const userInfo = await authAPI.getCurrentUser();
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Google OAuth login
  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    try {
      const response = await authAPI.googleLogin(idToken);

      // Save tokens
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Fetch user info
      const userInfo = await authAPI.getCurrentUser();
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      removeAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('refresh_token');
    }
  };

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await authAPI.refreshToken(storedRefreshToken);

      // Save new access token
      setAuthToken(response.access_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithEmail,
      register,
      loginWithGoogle,
      logout,
      refreshToken,
      isAdmin,
      isAuthenticated,
      isLoading
    }}>
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

