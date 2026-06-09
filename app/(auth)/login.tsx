// app/(auth)/login.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    // Validation des champs
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email.");
      return;
    }

    if (!password) {
      Alert.alert("Erreur", "Veuillez entrer votre mot de passe.");
      return;
    }

    setLocalLoading(true);

    try {
      console.log("Tentative de connexion avec:", email);

      const loggedInUser = await login(email.trim(), password);

      console.log("Résultat de connexion:", loggedInUser);

      if (loggedInUser) {
        if (loggedInUser.role === "pedagogic_director") {
          router.replace("/(director)/director-dashboard");
        } else if (loggedInUser.role === "student") {
          router.replace("/(tabs)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("Erreur", "Email ou mot de passe incorrect");
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      Alert.alert(
        "Erreur de connexion",
        error.message || "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoadingState = isLoading || localLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎓</Text>
          <Text style={styles.title}>JobMatch AI</Text>
        </View>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        <View style={styles.form}>
          {/* Champ Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoadingState}
            />
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Votre mot de passe"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!isLoadingState}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoadingState}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lien mot de passe oublié */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => router.push("/(auth)/forgot-password")}
            disabled={isLoadingState}
          >
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.button, isLoadingState && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoadingState}
          >
            {isLoadingState ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Lien vers inscription */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              disabled={isLoadingState}
            >
              <Text style={styles.registerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          {/* Informations de test */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>🔐 Comptes de démonstration :</Text>
            <TouchableOpacity
              onPress={() => {
                setEmail("etudiant@test.com");
                setPassword("123456");
              }}
            >
              <Text style={styles.demoText}>
                👨‍🎓 Étudiant: etudiant@test.com
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEmail("directeur@test.com");
                setPassword("123456");
              }}
            >
              <Text style={styles.demoText}>
                👨‍🏫 Directeur: directeur@test.com
              </Text>
            </TouchableOpacity>
            <Text style={styles.demoInfo}>Mot de passe: 123456</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E7FF",
    textAlign: "center",
    marginBottom: 48,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPassword: {
    color: "#4F46E5",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4F46E5",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  separatorText: {
    marginHorizontal: 12,
    color: "#9CA3AF",
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  registerLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  demoContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: "#4F46E5",
    marginBottom: 4,
  },
  demoInfo: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    fontStyle: "italic",
  },
});
