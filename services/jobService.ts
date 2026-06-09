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
  description: string;
  url: string;
  source: string;
  matchingScore: number;
  skills: string[];
}

export async function searchJobs(keyword: string, location: string): Promise<JobOffer[]> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      console.log('No token found, user not authenticated');
      return [];
    }
    
    const url = `${API_BASE_URL}/jobs/search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    console.log('Searching jobs at:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Search response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la recherche');
    }
    
    return data.jobs || [];
  } catch (error) {
    console.error('Search jobs error:', error);
    return [];
  }
}

export async function getRecommendations(): Promise<{ recommendations: JobOffer[], hasSkills: boolean }> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      console.log('No token found, user not authenticated');
      return { recommendations: [], hasSkills: false };
    }
    
    const url = `${API_BASE_URL}/jobs/recommendations`;
    console.log('Getting recommendations from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Recommendations response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération');
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

export async function getJobDetails(jobId: string): Promise<JobOffer | null> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    const response = await fetch(`${API_BASE_URL}/jobs/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération');
    }
    
    return data.job || null;
  } catch (error) {
    console.error('Get job details error:', error);
    return null;
  }
}