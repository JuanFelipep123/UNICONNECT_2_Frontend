import type { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthContextValue {
  /** The current authenticated user (null if not logged in) */
  user: AuthUser | null;
  /** The raw Supabase session */
  session: Session | null;
  /** True while the initial session is being restored */
  isLoading: boolean;
  /** Starts the Google OAuth flow */
  signInWithGoogle: () => Promise<void>;
  /** Signs the user out */
  signOut: () => Promise<void>;
}

/** Maps a Supabase User to our lightweight AuthUser */
export function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? user.user_metadata?.name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

/** Allowed email domain */
export const ALLOWED_DOMAIN = "@ucaldas.edu.co";
