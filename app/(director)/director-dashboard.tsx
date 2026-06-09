import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DirectorDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour, {user?.firstName || "Directeur"}
        </Text>
        <Text style={styles.subtitle}>Tableau de bord - Analyse du marché</Text>
      </View>
      <View style={{ height: 40 }} />
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statValue}>1,247</Text>
          <Text style={styles.statLabel}>Offres analysées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statValue}>89</Text>
          <Text style={styles.statLabel}>Compétences</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutHeaderButton}
        onPress={() => setShowLogoutModal(true)}
      >
        <Text style={styles.logoutHeaderButtonText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences les plus demandées</Text>

        <View style={styles.skillItem}>
          <Text style={styles.skillRank}>#1</Text>
          <Text style={styles.skillName}>React.js</Text>
          <Text style={styles.skillCount}>234 offres</Text>
        </View>

        <View style={styles.skillItem}>
          <Text style={styles.skillRank}>#2</Text>
          <Text style={styles.skillName}>Python</Text>
          <Text style={styles.skillCount}>198 offres</Text>
        </View>

        <View style={styles.skillItem}>
          <Text style={styles.skillRank}>#3</Text>
          <Text style={styles.skillName}>Java</Text>
          <Text style={styles.skillCount}>167 offres</Text>
        </View>

        <View style={styles.skillItem}>
          <Text style={styles.skillRank}>#4</Text>
          <Text style={styles.skillName}>Node.js</Text>
          <Text style={styles.skillCount}>145 offres</Text>
        </View>

        <View style={styles.skillItem}>
          <Text style={styles.skillRank}>#5</Text>
          <Text style={styles.skillName}>SQL</Text>
          <Text style={styles.skillCount}>132 offres</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Secteurs qui recrutent</Text>

        <View style={styles.sectorItem}>
          <Text style={styles.sectorName}>Tech / IT</Text>
          <View style={styles.sectorBar}>
            <View style={[styles.sectorBarFill, { width: "100%" }]} />
          </View>
          <Text style={styles.sectorCount}>456 offres</Text>
        </View>

        <View style={styles.sectorItem}>
          <Text style={styles.sectorName}>Finance / Banque</Text>
          <View style={styles.sectorBar}>
            <View style={[styles.sectorBarFill, { width: "51%" }]} />
          </View>
          <Text style={styles.sectorCount}>234 offres</Text>
        </View>

        <View style={styles.sectorItem}>
          <Text style={styles.sectorName}>Marketing Digital</Text>
          <View style={styles.sectorBar}>
            <View style={[styles.sectorBarFill, { width: "41%" }]} />
          </View>
          <Text style={styles.sectorCount}>189 offres</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            📈 Voir statistiques détaillées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            ⚠️ Analyser les gaps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            📄 Générer un rapport
          </Text>
        </TouchableOpacity>

        {/* Modal de confirmation de déconnexion */}
        <Modal visible={showLogoutModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Text style={styles.modalIconText}>👋</Text>
              </View>
              <Text style={styles.modalTitle}>Déconnexion</Text>
              <Text style={styles.modalMessage}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.confirmButtonText}>Se déconnecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    padding: 20,
    backgroundColor: "#4F46E5",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  skillRank: {
    width: 40,
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  skillName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  skillCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10B981",
  },
  sectorItem: {
    marginBottom: 16,
  },
  sectorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  sectorBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 4,
  },
  sectorBarFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  sectorCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#4F46E5",
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutHeaderButton: {
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
