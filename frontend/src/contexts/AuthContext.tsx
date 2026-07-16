import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { PaperAirplaneToast } from '../components/PaperAirplaneToast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Expiration time in milliseconds (30 days)
const SESSION_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastName, setToastName] = useState('');

  useEffect(() => {
    // 1. Firebase level limit: Session persists across browser restarts
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // 2. Strict time-based limit: Check expiration time on every state change
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const loginTimeStr = localStorage.getItem('ebooklandia_login_ts');
        if (loginTimeStr) {
          const loginTime = parseInt(loginTimeStr, 10);
          if (Date.now() - loginTime > SESSION_EXPIRATION_MS) {
            // Session expired strictly by time
            console.warn("Session expired. Logging out.");
            signOut(auth).then(() => {
              localStorage.removeItem('ebooklandia_login_ts');
              setUser(null);
              setLoading(false);
            });
            return;
          }
        } else {
          // Fallback if no timestamp exists
          localStorage.setItem('ebooklandia_login_ts', Date.now().toString());
        }

      } else {
        localStorage.removeItem('ebooklandia_login_ts');
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem('ebooklandia_login_ts', Date.now().toString());
      
      // Trigger the welcome toast directly
      setToastName(result.user.displayName?.split(' ')[0] || '');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
      
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('ebooklandia_login_ts');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
      <PaperAirplaneToast show={showToast} name={toastName} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
