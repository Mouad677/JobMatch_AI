import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

// Simuler un contexte d'auth simple pour le démarrage
function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simuler un chargement
    setTimeout(() => setIsReady(true), 500);
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#4F46E5",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SimpleThemeProvider>
      <SimpleAuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(director)" />
        </Stack>
      </SimpleAuthProvider>
    </SimpleThemeProvider>
  );
}
