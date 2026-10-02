import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleDemo: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (name: string, avatar?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'chatgpt_app_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Basic validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // In a production app, verify against backend. Here we simulate successful auth
    const derivedName = email.split('@')[0];
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const loggedUser: User = {
      id: 'usr_' + Date.now(),
      name: formattedName,
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    };

    saveUserSession(loggedUser);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) {
      return { success: false, error: 'Please enter your name' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return { success: true };
  };

  const loginWithGoogleDemo = async () => {
    const googleUser: User = {
      id: 'usr_google_' + Date.now(),
      name: 'Google User',
      email: 'alex.developer@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    saveUserSession(googleUser);
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'usr_guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@chatgpt.mobile',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      createdAt: new Date().toISOString(),
    };
    saveUserSession(guestUser);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove user session:', e);
    }
  };

  const updateProfile = (name: string, avatar?: string) => {
    if (!user) return;
    const updated = { ...user, name, ...(avatar ? { avatar } : {}) };
    saveUserSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogleDemo,
        loginAsGuest,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
