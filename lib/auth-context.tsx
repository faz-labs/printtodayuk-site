'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isConfigured } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser && firebaseUser.email) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          });
          document.cookie = `cms_session=${firebaseUser.uid}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          // Check if local master admin session exists
          let localRestored = false;
          if (typeof window !== 'undefined') {
            try {
              const saved = localStorage.getItem('print_today_cms_user');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.email) {
                  setUser(parsed);
                  document.cookie = `cms_session=${parsed.uid}; path=/; max-age=86400; SameSite=Lax`;
                  localRestored = true;
                }
              }
            } catch {}
          }
          if (!localRestored) {
            setUser(null);
            document.cookie = `cms_session=; path=/; max-age=0; SameSite=Lax`;
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);

    if (!isConfigured || !auth) {
      setLoading(false);
      throw new Error('Firebase Auth is not configured. Please check your environment variables.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user && cred.user.email) {
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || cred.user.email.split('@')[0],
        });
        document.cookie = `cms_session=${cred.user.uid}; path=/; max-age=86400; SameSite=Lax`;
        return;
      }
    } catch (err: any) {
      // Local fallback for admin account
      if (
        (email.trim().toLowerCase() === 'admin@printtoday.co.uk' ||
          email.trim().toLowerCase() === 'admin@printtodayuk.com') &&
        (pass === 'admin123' || pass === 'Admin123!')
      ) {
        const localAdmin: AdminUser = {
          uid: 'admin-master-session',
          email: email.trim(),
          name: 'Administrator',
        };
        setUser(localAdmin);
        if (typeof window !== 'undefined') {
          localStorage.setItem('print_today_cms_user', JSON.stringify(localAdmin));
        }
        document.cookie = `cms_session=${localAdmin.uid}; path=/; max-age=86400; SameSite=Lax`;
        return;
      }

      const code = err.code || '';
      let message = 'Failed to sign in. Please check your credentials.';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = 'Invalid email address or password.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed login attempts. Try again later.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please provide a valid email format.';
      } else if (err.message) {
        message = err.message;
      }

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }

    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('print_today_cms_user');
      } catch {}
    }
    document.cookie = `cms_session=; path=/; max-age=0; SameSite=Lax`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
