import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../services/supabaseClient";
import { ALLOWED_DOMAIN } from "./types";

/**
 * Ensures the in-app browser auth session can complete.
 * Call this once at app startup (root layout).
 */
export function warmUpBrowser() {
  WebBrowser.warmUpAsync();
}

export function coolDownBrowser() {
  WebBrowser.coolDownAsync();
}

/**
 * Build the redirect URI that Supabase will call back after OAuth.
 *
 * Uses `expo-linking` so the URI is correct for the current runtime:
 *   - Expo Go  → exp://127.0.0.1:8081/--/
 *   - Dev build / standalone → uniconnect2://
 */
function getRedirectUri(): string {
  return Linking.createURL("/");
}

/**
 * Validates that the email belongs to the allowed institutional domain.
 */
export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}

/**
 * Starts the Google OAuth flow via Supabase, opens the browser,
 * and exchanges the resulting session.
 *
 * Throws if:
 *  - Supabase fails to generate an OAuth URL
 *  - The user cancels or the browser flow fails
 *  - The authenticated email is not from the allowed domain
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getRedirectUri();

  // Log para verificar la URI generada (agrega esta URL en Supabase Dashboard → Auth → URL Configuration → Redirect URLs)
  console.log("[Auth] Redirect URI:", redirectTo);

  // 1. Ask Supabase for the Google OAuth URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data?.url) {
    throw new Error(
      error?.message ?? "No se pudo iniciar la autenticación con Google.",
    );
  }

  // 2. Open the OAuth URL in an in-app browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !result.url) {
    throw new Error("El inicio de sesión fue cancelado.");
  }

  console.log("[Auth] Redirect result URL:", result.url);

  // 3. Extract tokens from the redirect URL
  //    Supabase returns tokens in the fragment (#) but Expo Go may
  //    restructure the URL, so we check both fragment and query params.
  const parsedUrl = Linking.parse(result.url);

  // Try fragment first (standard Supabase behaviour)
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  // Check if tokens are in the fragment (#access_token=...&refresh_token=...)
  const hashIndex = result.url.indexOf("#");
  if (hashIndex !== -1) {
    const fragment = result.url.substring(hashIndex + 1);
    const fragmentParams = new URLSearchParams(fragment);
    accessToken = fragmentParams.get("access_token");
    refreshToken = fragmentParams.get("refresh_token");
  }

  // Fallback: check query params (Expo Go sometimes converts fragments)
  if (!accessToken || !refreshToken) {
    const queryParams = parsedUrl.queryParams ?? {};
    accessToken = (queryParams.access_token as string) ?? null;
    refreshToken = (queryParams.refresh_token as string) ?? null;
  }

  if (!accessToken || !refreshToken) {
    throw new Error("No se recibieron los tokens de autenticación.");
  }

  // 4. Set the session in Supabase client
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError || !sessionData.session) {
    throw new Error(sessionError?.message ?? "Error al establecer la sesión.");
  }

  // 5. Validate domain
  const email = sessionData.session.user.email ?? "";
  if (!isAllowedEmail(email)) {
    // Sign out immediately – the domain is not allowed
    await supabase.auth.signOut();
    throw new Error(
      "Acceso denegado. Solo se permiten correos institucionales @ucaldas.edu.co.",
    );
  }
}

/**
 * Signs the current user out from Supabase.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
