// services/jobService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  return 'https://api.jobmatch-ai.com/api';
};

const API_BASE_URL = getBaseUrl();

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  contractType: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  matchingScore: number;
  skills: string[];
}

export async function searchJobs(keyword: string, location: string): Promise<JobOffer[]> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      console.log('No token found');
      return [];
    }
    
    const url = `${API_BASE_URL}/jobs/search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    console.log('Searching:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Search results:', data.count);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la recherche');
    }
    
    return data.jobs || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getRecommendations(): Promise<{ recommendations: JobOffer[], hasSkills: boolean }> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      return { recommendations: [], hasSkills: false };
    }
    
    const response = await fetch(`${API_BASE_URL}/jobs/recommendations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur');
    }
    
    return {
      recommendations: data.recommendations || [],
      hasSkills: data.hasSkills || false
    };
  } catch (error) {
    console.error('Get recommendations error:', error);
    return { recommendations: [], hasSkills: false };
  }
}