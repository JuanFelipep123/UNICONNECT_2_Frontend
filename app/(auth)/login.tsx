import { useAuth } from "@/src/features/auth/authHooks";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch {
      // Error is already handled via Alert in authContext
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="school-outline" size={72} color={colors.gold} />
        </View>
        <Text style={styles.appName}>UniConnect</Text>
        <Text style={styles.tagline}>
          Conecta con tu comunidad universitaria
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.card}>
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.instructionText}>
            Inicia sesión con tu correo institucional para acceder a la
            plataforma.
          </Text>

          <TouchableOpacity
            style={[
              styles.googleButton,
              isProcessing && styles.googleButtonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.buttonIcon}
              />
            ) : (
              <Ionicons
                name="logo-google"
                size={22}
                color="#fff"
                style={styles.buttonIcon}
              />
            )}
            <Text style={styles.googleButtonText}>
              {isProcessing ? "Procesando…" : "Continuar con Google"}
            </Text>
          </TouchableOpacity>

          <View style={styles.domainNotice}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.gold}
            />
            <Text style={styles.domainText}>
              Solo correos{" "}
              <Text style={styles.domainHighlight}>@ucaldas.edu.co</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(197, 160, 89, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  domainNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  domainText: {
    fontSize: 13,
    color: "#64748B",
  },
  domainHighlight: {
    color: colors.gold,
    fontWeight: "600",
  },
});
