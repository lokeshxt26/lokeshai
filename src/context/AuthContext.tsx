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

const CURRENT_USER_KEY = 'askme_current_user';
const USERS_DB_KEY = 'askme_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on initial load
  useEffect(() => {
    try {
      // Initialize demo user if empty
      const existingDb = localStorage.getItem(USERS_DB_KEY);
      if (!existingDb) {
        const defaultUsers: User[] = [
          {
            id: 'usr_demo_1',
            name: 'Demo User',
            email: 'demo.user@chatgpt.mobile',
            password: 'demo1234',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'usr_lokesh',
            name: 'Lokesh',
            email: 'lokesh@askme.ai',
            password: 'password123',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lokesh',
            createdAt: new Date().toISOString(),
          }
        ];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
      }

      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRegisteredUsers = (): User[] => {
    try {
      const db = localStorage.getItem(USERS_DB_KEY);
      return db ? JSON.parse(db) : [];
    } catch {
      return [];
    }
  };

  const saveUserSession = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password' };
    }

    const users = getRegisteredUsers();
    const foundUser = users.find((u) => u.email === cleanEmail);

    if (!foundUser) {
      // If user doesn't exist, allow auto-creation or clear error
      return {
        success: false,
        error: 'No account found with this email. Please click "Sign Up" above to create an account.',
      };
    }

    if (foundUser.password && foundUser.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar,
      createdAt: foundUser.createdAt,
    };

    saveUserSession(sessionUser);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your name' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please Sign In.' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      createdAt: new Date().toISOString(),
    };

    // Save to users database
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));

    // Save session
    saveUserSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    });

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
      id: 'usr_guest',
      name: 'Guest User',
      email: 'guest@askme.ai',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      createdAt: new Date().toISOString(),
    };
    saveUserSession(guestUser);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
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
