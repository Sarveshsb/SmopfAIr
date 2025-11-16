import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const { data: subscription } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!session) {
        // Create a guest account automatically
        await supabase.auth.signUp({
          email: crypto.randomUUID() + "@guest.com",
          password: "guest123"
        });
      }
      setUser(session?.user ?? null);
      setLoading(false);
    }
  );

  return () => subscription?.unsubscribe();
}, []);

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
  try {
    // Try normal sign-in first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // If user does not exist → Supabase returns 400
    if (error && error.status === 400) {
      // Create new account automatically
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        return { error: signUpError };
      }

      // Now login again after signup
      const { data: finalLogin, error: finalErr } =
        await supabase.auth.signInWithPassword({ email, password });

      return { data: finalLogin, error: finalErr };
    }

    return { data, error };
  } catch (err: any) {
    return { error: err };
  }
};

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('UseAuth must be used Authprovider');
  }
  return context;
}
