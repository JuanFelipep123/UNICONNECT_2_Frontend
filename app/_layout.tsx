import { AuthProvider } from "@/src/features/auth/authContext";
import { useAuth } from "@/src/features/auth/authHooks";
import { colors } from "@/src/theme/colors";
import { Stack, useRouter, useSegments } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// Allow the in-app browser to complete the OAuth redirect
WebBrowser.maybeCompleteAuthSession();

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Not signed in → go to login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Signed in → go to home
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
