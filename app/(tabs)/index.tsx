// app/(tabs)/index.tsx
import { useAuth } from '@/contexts/AuthContext';
import { getStudentSkills } from '@/services/cvService';
import { getRecommendations, JobOffer, searchJobs } from '@/services/jobService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { student } = useAuth();
  const [recommendations, setRecommendations] = useState<JobOffer[]>([]);
  const [hasSkills, setHasSkills] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Vérifier si l'utilisateur a des compétences
      const skills = await getStudentSkills();
      console.log('Student skills:', skills);
      const hasAnySkills = skills && skills.length > 0;
      setHasSkills(hasAnySkills);
      
      if (hasAnySkills) {
        // Charger les recommandations depuis l'API
        const { recommendations: recs } = await getRecommendations();
        console.log('Recommendations from API:', recs);
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Info', 'Veuillez entrer un mot-clé de recherche');
      return;
    }
    
    setIsSearching(true);
    try {
      console.log('Searching for:', searchQuery, searchLocation);
      const results = await searchJobs(searchQuery, searchLocation);
      console.log('Search results:', results);
      setRecommendations(results);
      
      if (results.length === 0) {
        Alert.alert('Aucun résultat', 'Aucune offre trouvée pour votre recherche');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour, {student?.firstName || 'Étudiant'} 👋
        </Text>
        <Text style={styles.subtitle}>
          {hasSkills 
            ? 'Voici les offres qui correspondent à votre profil'
            : 'Importez votre CV dans l\'onglet Profil pour recevoir des recommandations personnalisées'}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ex: Développeur React, Data Scientist..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <Text style={styles.searchButtonText}>🔍</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Message si pas de compétences */}
      {!hasSkills && !isSearching && recommendations.length === 0 && (
        <View style={styles.noSkillsContainer}>
          <Text style={styles.noSkillsEmoji}>📄</Text>
          <Text style={styles.noSkillsTitle}>Aucune compétence enregistrée</Text>
          <Text style={styles.noSkillsText}>
            Importez votre CV pour recevoir des recommandations personnalisées
          </Text>
          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.importButtonText}>Importer mon CV</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Résultats */}
      {recommendations.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {isSearching ? 'Recherche en cours...' : `${recommendations.length} offre${recommendations.length !== 1 ? 's' : ''} trouvée${recommendations.length !== 1 ? 's' : ''}`}
          </Text>
          
          {!isSearching && recommendations.map((job, index) => (
            <TouchableOpacity 
              key={job.id || index} 
              style={styles.jobCard}
              onPress={() => {
                if (job.url) {
                  // Ouvrir l'URL dans le navigateur
                  Alert.alert('Offre d\'emploi', `Voir l'offre sur ${job.source}`, [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Voir', onPress: () => {
                      // Rediriger vers l'URL
                      router.push(`/job/${job.id}`);
                    } }
                  ]);
                }
              }}
            >
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.matchingScore > 0 && (
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(job.matchingScore) }]}>
                    <Text style={styles.scoreText}>{job.matchingScore}%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.companyName}>{job.company}</Text>
              <Text style={styles.jobLocation}>📍 {job.location || 'Maroc'}</Text>
              <Text style={styles.jobSource}>📌 Source: {job.source || 'API'}</Text>
              
              {job.skills && job.skills.length > 0 && (
                <View style={styles.skillsContainer}>
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
              
              {job.matchingScore > 0 && (
                <View style={styles.matchContainer}>
                  <Text style={styles.matchLabel}>{getScoreLabel(job.matchingScore)}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Message quand aucune offre trouvée après recherche */}
      {!isSearching && hasSkills && recommendations.length === 0 && searchQuery && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsEmoji}>🔍</Text>
          <Text style={styles.noResultsTitle}>Aucune offre trouvée</Text>
          <Text style={styles.noResultsText}>
            Essayez d'autres mots-clés comme "Développeur", "Data", "Marketing"...
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleSearch}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#4F46E5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
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
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  jobSource: {
    fontSize: 11,
    color: '#A78BFA',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 11,
    color: '#4B5563',
  },
  matchContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  matchLabel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});