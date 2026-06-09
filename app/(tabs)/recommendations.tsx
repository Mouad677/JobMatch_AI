// app/(tabs)/recommendations.tsx
import { useAuth } from '@/contexts/AuthContext';
import { getStudentSkills } from '@/services/cvService';
import { getRecommendations, JobOffer } from '@/services/jobService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { student } = useAuth();
  const [recommendations, setRecommendations] = useState<JobOffer[]>([]);
  const [hasSkills, setHasSkills] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Vérifier si l'utilisateur a des compétences
      const skills = await getStudentSkills();
      const hasAnySkills = skills && skills.length > 0;
      setHasSkills(hasAnySkills);
      
      console.log('📊 Compétences étudiant:', skills?.length || 0);
      
      if (hasAnySkills) {
        // Charger les recommandations depuis l'API
        const { recommendations: recs } = await getRecommendations();
        console.log('🎯 Recommandations reçues:', recs?.length || 0);
        setRecommendations(recs || []);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement recommandations:', error);
      Alert.alert('Erreur', 'Impossible de charger les recommandations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecommendations();
  }, []);

  const handleJobPress = (job: JobOffer) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const openJobUrl = async (url: string) => {
    if (!url) {
      Alert.alert('Info', 'Lien non disponible pour cette offre');
      return;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Bon match';
    if (score >= 40) return 'Match moyen';
    return 'Match faible';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
      return `Il y a ${Math.floor(diffDays / 30)} mois`;
    } catch (error) {
      return 'Date inconnue';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des recommandations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommandations</Text>
        <Text style={styles.headerSubtitle}>
          {hasSkills 
            ? `${recommendations.length} offre${recommendations.length !== 1 ? 's' : ''} correspondant à votre profil`
            : 'Importez votre CV pour recevoir des recommandations'}
        </Text>
      </View>

      {/* Message si pas de compétences */}
      {!hasSkills && (
        <View style={styles.noSkillsContainer}>
          <Text style={styles.noSkillsEmoji}>📄</Text>
          <Text style={styles.noSkillsTitle}>Aucune compétence enregistrée</Text>
          <Text style={styles.noSkillsText}>
            Pour recevoir des recommandations personnalisées, importez d'abord votre CV dans l'onglet Profil.
          </Text>
          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.importButtonText}>Importer mon CV</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des recommandations */}
      {hasSkills && (
        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
          }
        >
          {recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔍</Text>
              <Text style={styles.emptyStateTitle}>Aucune recommandation</Text>
              <Text style={styles.emptyStateText}>
                Aucune offre ne correspond à votre profil pour le moment.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Essayez d'ajouter plus de compétences ou de modifier votre recherche.
              </Text>
            </View>
          ) : (
            recommendations.map((job, index) => (
              <TouchableOpacity
                key={job.id || index}
                style={styles.recommendationCard}
                onPress={() => handleJobPress(job)}
                activeOpacity={0.7}
              >
                {/* Score badge */}
                {job.matchingScore > 0 && (
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(job.matchingScore) }]}>
                    <Text style={styles.scoreBadgeText}>{job.matchingScore}%</Text>
                  </View>
                )}

                {/* Contenu principal */}
                <View style={styles.cardContent}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.companyName}>{job.company}</Text>
                  
                  <View style={styles.jobDetails}>
                    <Text style={styles.jobLocation}>📍 {job.location || 'Maroc'}</Text>
                    <Text style={styles.jobSource}>📌 {job.source || 'Offre d\'emploi'}</Text>
                  </View>

                  {/* Barre de progression du score */}
                  {job.matchingScore > 0 && (
                    <View style={styles.scoreBarContainer}>
                      <View style={styles.scoreBar}>
                        <View 
                          style={[
                            styles.scoreBarFill, 
                            { width: `${job.matchingScore}%`, backgroundColor: getScoreColor(job.matchingScore) }
                          ]} 
                        />
                      </View>
                      <Text style={styles.scoreBarText}>
                        {getScoreLabel(job.matchingScore)}
                      </Text>
                    </View>
                  )}

                  {/* Tags compétences */}
                  {job.skills && job.skills.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <View key={idx} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                      {job.skills.length > 3 && (
                        <View style={styles.skillTag}>
                          <Text style={styles.skillTagText}>+{job.skills.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Modal détails */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        {selectedJob && (
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.modalBackButtonText}>← Retour</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Score principal */}
              {selectedJob.matchingScore > 0 && (
                <View style={[styles.modalScoreBadge, { backgroundColor: getScoreColor(selectedJob.matchingScore) }]}>
                  <Text style={styles.modalScoreText}>{selectedJob.matchingScore}%</Text>
                  <Text style={styles.modalScoreLabel}>{getScoreLabel(selectedJob.matchingScore)}</Text>
                </View>
              )}

              {/* Infos job */}
              <Text style={styles.modalJobTitle}>{selectedJob.title}</Text>
              <Text style={styles.modalCompanyName}>{selectedJob.company}</Text>

              <View style={styles.modalJobMeta}>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>📍 Localisation</Text>
                  <Text style={styles.modalMetaValue}>{selectedJob.location || 'Maroc'}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>📌 Source</Text>
                  <Text style={styles.modalMetaValue}>{selectedJob.source || 'API'}</Text>
                </View>
              </View>

              {/* Compétences requises */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <View style={styles.modalSkillsContainer}>
                  <Text style={styles.sectionTitle}>Compétences détectées</Text>
                  <View style={styles.modalSkillsList}>
                    {selectedJob.skills.map((skill, index) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillTagText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Description */}
              {selectedJob.description && (
                <View style={styles.modalDescriptionContainer}>
                  <Text style={styles.sectionTitle}>Description du poste</Text>
                  <Text style={styles.modalDescriptionText}>
                    {selectedJob.description.length > 500 
                      ? selectedJob.description.substring(0, 500) + '...' 
                      : selectedJob.description}
                  </Text>
                </View>
              )}

              {/* Bouton postuler */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => openJobUrl(selectedJob.url)}
              >
                <Text style={styles.applyButtonText}>Voir l'offre originale</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  noSkillsContainer: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  noSkillsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noSkillsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noSkillsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardContent: {
    paddingRight: 50,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  jobSource: {
    fontSize: 12,
    color: '#A78BFA',
  },
  scoreBarContainer: {
    marginBottom: 12,
  },
  scoreBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 4,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreBarText: {
    fontSize: 10,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 10,
    color: '#4B5563',
  },
  bottomPadding: {
    height: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBackButton: {
    padding: 8,
  },
  modalBackButtonText: {
    fontSize: 16,
    color: '#4F46E5',
  },
  modalContent: {
    padding: 20,
  },
  modalScoreBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalScoreLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  modalJobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalCompanyName: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalJobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  modalMetaItem: {
    alignItems: 'center',
  },
  modalMetaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalMetaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  modalSkillsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalSkillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSkillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSkillTagText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalDescriptionContainer: {
    marginBottom: 24,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});