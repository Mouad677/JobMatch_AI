// app/(auth)/register.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    fieldOfStudy: "",
    currentLevel: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour les modals personnalisés
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  const studyLevels = [
    "BAC",
    "BAC+2 (DUT/DEUG)",
    "BAC+3 (Licence)",
    "BAC+4 (Master 1)",
    "BAC+5 (Master 2)",
    "BAC+6+ (Doctorat)",
  ];

  const studyFields = [
    "Informatique et Génie Logiciel",
    "Data Science et Intelligence Artificielle",
    "Réseaux et Télécommunications",
    "Gestion et Finance",
    "Marketing et Commerce",
    "Ressources Humaines",
    "Génie Civil",
    "Génie Mécanique",
    "Énergies Renouvelables",
    "Autre",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!formData.fieldOfStudy) {
      newErrors.fieldOfStudy = "Veuillez sélectionner votre filière";
    }

    if (!formData.currentLevel) {
      newErrors.currentLevel = "Veuillez sélectionner votre niveau";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showErrorAlert(
        "Formulaire incomplet",
        "Veuillez corriger les erreurs dans le formulaire avant de continuer.",
      );
      return;
    }

    try {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        fieldOfStudy: formData.fieldOfStudy,
        currentLevel: formData.currentLevel,
        phoneNumber: formData.phoneNumber,
      });

      // Succès - Afficher le message personnalisé
      setSuccessData({
        firstName: formData.firstName,
        email: formData.email,
        fieldOfStudy: formData.fieldOfStudy,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      // Échec - Afficher message d'erreur personnalisé
      let message = "Une erreur est survenue lors de la création du compte.";

      if (
        error.message.includes("email existe") ||
        error.message.includes("already exists")
      ) {
        message =
          "❌ Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.";
      } else if (
        error.message.includes("réseau") ||
        error.message.includes("network")
      ) {
        message =
          "📡 Problème de connexion au serveur. Vérifiez votre connexion internet.";
      } else if (error.message.includes("champs")) {
        message =
          "📝 Tous les champs obligatoires doivent être remplis correctement.";
      } else {
        message = `❌ ${error.message || "Erreur inattendue. Veuillez réessayer plus tard."}`;
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    }
  };

  const showErrorAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>JobMatch AI</Text>
            <Text style={styles.subtitle}>Créez votre compte étudiant</Text>
          </View>

          <View style={styles.form}>
            {/* Prénom et Nom */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="Votre prénom"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(text) => updateField("firstName", text)}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="Votre nom"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(text) => updateField("lastName", text)}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="exemple@email.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Téléphone */}
            <View>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="06 XX XX XX XX"
                placeholderTextColor="#9CA3AF"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField("phoneNumber", text)}
                keyboardType={Platform.OS === "web" ? "text" : "phone-pad"}
              />
            </View>

            {/* Filière d'étude */}
            <View>
              <Text style={styles.label}>Filière d'étude *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {studyFields.map((field) => (
                    <TouchableOpacity
                      key={field}
                      style={[
                        styles.pickerOption,
                        formData.fieldOfStudy === field &&
                          styles.pickerOptionSelected,
                      ]}
                      onPress={() => updateField("fieldOfStudy", field)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.fieldOfStudy === field &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {field}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {errors.fieldOfStudy && (
                <Text style={styles.errorText}>{errors.fieldOfStudy}</Text>
              )}
            </View>

            {/* Niveau d'étude */}
            <View>
              <Text style={styles.label}>Niveau d'étude *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {studyLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        formData.currentLevel === level &&
                          styles.pickerOptionSelected,
                      ]}
                      onPress={() => updateField("currentLevel", level)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.currentLevel === level &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {errors.currentLevel && (
                <Text style={styles.errorText}>{errors.currentLevel}</Text>
              )}
            </View>

            {/* Mot de passe */}
            <View>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="Au moins 6 caractères"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => updateField("password", text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirmation mot de passe */}
            <View>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Conditions d'utilisation */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                En créant un compte, vous acceptez nos{" "}
                <Text style={styles.termsLink}>Conditions d'utilisation</Text>{" "}
                et notre{" "}
                <Text style={styles.termsLink}>
                  Politique de confidentialité
                </Text>
              </Text>
            </View>

            {/* Bouton d'inscription */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de succès personnalisé */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Compte créé avec succès !</Text>
            <Text style={styles.successMessage}>
              Bienvenue {successData?.firstName} ! Votre compte a été créé avec
              succès.
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetailText}>
                📧 Email : {successData?.email}
              </Text>
              <Text style={styles.successDetailText}>
                🎓 Filière : {successData?.fieldOfStudy}
              </Text>
            </View>
            <Text style={styles.successInstruction}>
              Vous allez être redirigé vers votre espace personnel.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/(tabs)");
              }}
            >
              <Text style={styles.successButtonText}>
                Commencer l'aventure →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur personnalisé */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Création de compte impossible</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>

            <View style={styles.errorHelpContainer}>
              <Text style={styles.errorHelpTitle}>Solutions possibles :</Text>
              <Text style={styles.errorHelpText}>
                • Vérifiez que l'email n'est pas déjà utilisé
              </Text>
              <Text style={styles.errorHelpText}>
                • Assurez-vous que tous les champs sont remplis
              </Text>
              <Text style={styles.errorHelpText}>
                • Vérifiez votre connexion internet
              </Text>
              <Text style={styles.errorHelpText}>
                • Contactez le support si le problème persiste
              </Text>
            </View>

            <View style={styles.errorButtonsContainer}>
              <TouchableOpacity
                style={styles.errorRetryButton}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.errorRetryButtonText}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorContactButton}
                onPress={() => {
                  setShowErrorModal(false);
                  router.push("/(auth)/login");
                }}
              >
                <Text style={styles.errorContactButtonText}>
                  Aller à la connexion
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E7FF",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
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
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginBottom: 12,
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
  pickerContainer: {
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: "#4F46E5",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  pickerOptionTextSelected: {
    color: "#FFFFFF",
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4F46E5",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#6B7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Success Modal
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  successDetails: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
  },
  successDetailText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  successInstruction: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Error Modal
  errorModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  errorIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  errorIcon: {
    fontSize: 36,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  errorHelpContainer: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorHelpTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D97706",
    marginBottom: 8,
  },
  errorHelpText: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
  errorButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  errorRetryButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  errorRetryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorContactButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  errorContactButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});
