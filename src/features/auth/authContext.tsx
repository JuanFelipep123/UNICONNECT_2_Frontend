import type { Session } from "@supabase/supabase-js";
import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Alert } from "react-native";
import { supabase } from "../../services/supabaseClient";
import {
    signOut as authSignOut,
    signInWithGoogle as googleSignIn,
    isAllowedEmail,
} from "./authService";
import { AuthContextValue, AuthUser, mapUser } from "./types";

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession) {
        const email = currentSession.user.email ?? "";
        if (!isAllowedEmail(email)) {
          // Invalid domain found in persisted session — sign out silently
          supabase.auth.signOut().finally(() => {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          });
          return;
        }
        setSession(currentSession);
        setUser(mapUser(currentSession.user));
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        const email = newSession.user.email ?? "";
        if (!isAllowedEmail(email)) {
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        setSession(newSession);
        setUser(mapUser(newSession.user));
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await googleSignIn();
    } catch (err: any) {
      Alert.alert(
        "Error de autenticación",
        err.message ?? "Ocurrió un error inesperado.",
      );
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authSignOut();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "No se pudo cerrar la sesión.");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      signInWithGoogle,
      signOut,
    }),
    [user, session, isLoading, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
