// app/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";



export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("SplashScreen - isLoading:", isLoading);
    console.log("SplashScreen - user:", user);

    if (!isLoading) {
      if (user) {
        console.log("Redirection vers le dashboard selon le rôle:", user.role);
        if (user.role === "student") {
          router.replace("/(tabs)");
        } else if (user.role === "pedagogic_director") {
          router.replace("/(director)/director-dashboard");
        } else {
          router.replace("/(auth)/login");
        }
      } else {
        console.log("Aucun utilisateur, redirection vers login");
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🎓</Text>
        <Text style={styles.title}>JobMatch AI</Text>
      </View>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  spinner: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#E0E7FF",
  },
});
