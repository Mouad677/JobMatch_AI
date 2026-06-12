// app/(tabs)/profile.tsx
import { useAuth } from '@/contexts/AuthContext';
import { getStudentSkills, uploadCV } from '@/services/cvService';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, student, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // États pour l'import CV
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [extractedData, setExtractedData] = useState<any>({
    technicalSkills: [],
    softSkills: [],
    totalSkills: 0,
    textLength: 0
  });
  
  // États pour les compétences
  const [technicalSkills, setTechnicalSkills] = useState<any[]>([]);
  const [softSkills, setSoftSkills] = useState<any[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Charger les compétences au démarrage
  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const skills = await getStudentSkills();
      console.log('Compétences chargées:', skills);
      const technical = skills.filter((s: any) => s.category === 'TECHNICAL');
      const soft = skills.filter((s: any) => s.category === 'SOFT');
      setTechnicalSkills(technical);
      setSoftSkills(soft);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
      );
      router.replace('/(auth)/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fonction pour importer un CV
  const importCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const document = result.assets[0];
      setCvFileName(document.name);
      setShowCVModal(true);
      
      setIsUploadingCV(true);
      
      try {
        const data = await uploadCV(document);
        console.log('Données extraites:', data);
        
        // Vérifier que data existe et a les bonnes propriétés
        setExtractedData({
          technicalSkills: data?.technicalSkills || [],
          softSkills: data?.softSkills || [],
          totalSkills: data?.totalSkills || 0,
          textLength: data?.textLength || 0
        });
        
        // Recharger les compétences après l'import
        await loadSkills();
        
        Alert.alert('Succès', `${data?.totalSkills || 0} compétences ont été extraites de votre CV !`);
        
      } catch (error: any) {
        console.error('Erreur lors de l\'analyse du CV:', error);
        Alert.alert('Erreur', error.message || 'Impossible d\'analyser le CV. Veuillez réessayer.');
        setShowCVModal(false);
      } finally {
        setIsUploadingCV(false);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'import du CV:', error);
      Alert.alert('Erreur', 'Impossible de lire le fichier. Veuillez réessayer.');
    }
  };

  // Fonction pour fermer le modal CV
  const closeCVModal = () => {
    setShowCVModal(false);
    setExtractedData({
      technicalSkills: [],
      softSkills: [],
      totalSkills: 0,
      textLength: 0
    });
  };

  // Rendu des étoiles pour le niveau de compétence
  const renderProficiencyStars = (level: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, i <= level && styles.starFilled]}>
          ★
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* Section Import CV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Mon CV</Text>
        
        <TouchableOpacity 
          style={styles.uploadCVButton}
          onPress={importCV}
          disabled={isUploadingCV}
        >
          {isUploadingCV ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <>
              <Text style={styles.uploadCVIcon}>📄</Text>
              <Text style={styles.uploadCVText}>
                {cvFileName ? 'Mettre à jour mon CV' : 'Importer mon CV'}
              </Text>
              <Text style={styles.uploadCVSubtext}>PDF, DOC ou DOCX</Text>
            </>
          )}
        </TouchableOpacity>
        
        {cvFileName && (
          <View style={styles.cvInfoContainer}>
            <Text style={styles.cvInfoText}>📎 CV chargé : {cvFileName}</Text>
          </View>
        )}
      </View>

      {/* Compétences techniques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💻 Compétences techniques</Text>
        {isLoadingSkills ? (
          <ActivityIndicator color="#4F46E5" />
        ) : technicalSkills.length > 0 ? (
          technicalSkills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                {renderProficiencyStars(skill.proficiency_level || 3)}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySkillsContainer}>
            <Text style={styles.emptySkillsText}>Aucune compétence technique</Text>
            <Text style={styles.emptySkillsSubtext}>Importez votre CV pour détecter vos compétences</Text>
          </View>
        )}
      </View>

      {/* Compétences comportementales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤝 Soft Skills</Text>
        {isLoadingSkills ? (
          <ActivityIndicator color="#4F46E5" />
        ) : softSkills.length > 0 ? (
          <View style={styles.softSkillsContainer}>
            {softSkills.map((skill, index) => (
              <View key={index} style={styles.softSkillBadge}>
                <Text style={styles.softSkillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptySkillsContainer}>
            <Text style={styles.emptySkillsText}>Aucun soft skill</Text>
            <Text style={styles.emptySkillsSubtext}>Importez votre CV pour détecter vos soft skills</Text>
          </View>
        )}
      </View>

      {/* Informations personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Statut</Text>
          <Text style={styles.infoValue}>Étudiant</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Filière</Text>
          <Text style={styles.infoValue}>{student?.fieldOfStudy || 'Informatique'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Niveau</Text>
          <Text style={styles.infoValue}>{student?.currentLevel || 'Master'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Promotion</Text>
          <Text style={styles.infoValue}>{student?.graduationYear || 2025}</Text>
        </View>
      </View>

      

      {/* Bouton de déconnexion */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => setShowLogoutModal(true)}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        )}
      </TouchableOpacity>

      {/* Modal de confirmation de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
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

      {/* Modal d'édition de profil */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.editModalContent]}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <Text style={styles.modalMessage}>
              Cette fonctionnalité sera bientôt disponible.
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton, styles.fullWidthButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.confirmButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'extraction CV */}
      <Modal
        visible={showCVModal}
        transparent
        animationType="slide"
        onRequestClose={closeCVModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.cvModalContent]}>
            <View style={styles.cvModalHeader}>
              <Text style={styles.modalTitle}>📄 Analyse du CV</Text>
              <TouchableOpacity onPress={closeCVModal}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {isUploadingCV ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Analyse de votre CV en cours...</Text>
                <Text style={styles.loadingSubtext}>Extraction des compétences et expériences</Text>
              </View>
            ) : (
              <ScrollView style={styles.extractedDataContainer}>
                {/* Compétences techniques */}
                <Text style={styles.extractedTitle}>💻 Compétences techniques détectées</Text>
                <View style={styles.extractedSkillsWrapper}>
                  {extractedData.technicalSkills && extractedData.technicalSkills.length > 0 ? (
                    extractedData.technicalSkills.map((skill, index) => (
                      <View key={index} style={styles.extractedSkillBadge}>
                        <Text style={styles.extractedSkillText}>{skill.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSkillsText}>Aucune compétence technique détectée</Text>
                  )}
                </View>

                {/* Soft Skills */}
                <Text style={styles.extractedTitle}>🤝 Soft Skills détectés</Text>
                <View style={styles.extractedSkillsWrapper}>
                  {extractedData.softSkills && extractedData.softSkills.length > 0 ? (
                    extractedData.softSkills.map((skill, index) => (
                      <View key={index} style={[styles.extractedSkillBadge, styles.softSkillBadge]}>
                        <Text style={styles.extractedSkillText}>{skill.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSkillsText}>Aucun soft skill détecté</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.saveSkillsButton}
                  onPress={closeCVModal}
                >
                  <Text style={styles.saveSkillsButtonText}>
                    ✓ Terminer ({extractedData.totalSkills || 0} compétences trouvées)
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  uploadCVButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadCVIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadCVText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  uploadCVSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  cvInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cvInfoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  skillItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    color: '#D1D5DB',
    marginLeft: 2,
  },
  starFilled: {
    color: '#F59E0B',
  },
  softSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  softSkillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  softSkillText: {
    fontSize: 13,
    color: '#4B5563',
  },
  emptySkillsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySkillsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySkillsSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  editModalContent: {
    width: '85%',
  },
  cvModalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullWidthButton: {
    width: '100%',
  },
  cvModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  extractedDataContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  extractedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  extractedSkillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  extractedSkillBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  extractedSkillText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  noSkillsText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  saveSkillsButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  saveSkillsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});