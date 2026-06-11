// services/cvService.ts
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

export interface ExtractedSkill {
  name: string;
  type: 'technical' | 'soft';
  proficiency: number;
  detectedFrom: string;
}

export interface CVData {
  technicalSkills: ExtractedSkill[];
  softSkills: ExtractedSkill[];
  totalSkills: number;
  textLength: number;
}

export async function uploadCV(document: any): Promise<CVData> {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour importer un CV');
    }
    
    // Créer un FormData correct pour l'upload
    const formData = new FormData();
    
    // Lire le fichier correctement
    const response = await fetch(document.uri);
    const blob = await response.blob();
    
    formData.append('cv', blob, document.name);
    
    const uploadResponse = await fetch(`${API_BASE_URL}/cv/upload-cv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      throw new Error(data.error || 'Erreur lors de l\'upload');
    }
    
    return data.data;
  } catch (error) {
    console.error('Upload CV error:', error);
    throw error;
  }
}

export async function getStudentSkills() {
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    
    if (!token) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/cv/student-skills`, {
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
    
    return data.skills || [];
  } catch (error) {
    console.error('Get skills error:', error);
    return [];
  }
}