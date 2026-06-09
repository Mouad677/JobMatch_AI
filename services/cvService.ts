// services/cvService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
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

// Fonction de log détaillée
const log = (type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type}] [CVService]`;
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
};

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
  log('INFO', `📄 Début d'upload CV - Fichier: ${document.name}, Type: ${document.mimeType}`);
  
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    log('INFO', `Token présent: ${token ? 'OUI' : 'NON'}`);
    
    if (!token) {
      throw new Error('Vous devez être connecté pour importer un CV');
    }
    
    // Lire le fichier en base64
    log('INFO', '📖 Lecture du fichier...');
    const fileBase64 = await FileSystem.readAsStringAsync(document.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    log('INFO', `✅ Fichier lu - Taille: ${fileBase64.length} caractères`);
    
    // Envoyer au backend
    const url = `${API_BASE_URL}/cv/upload-cv`;
    log('INFO', `🌐 URL d'appel API: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: document.name,
        fileType: document.mimeType,
        fileContent: fileBase64,
      }),
    });
    const duration = Date.now() - startTime;
    
    log('INFO', `⏱️ Temps de réponse: ${duration}ms`);
    log('INFO', `📡 Status HTTP: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    log('INFO', `📦 Réponse brute de l'API:`, data);
    
    if (!response.ok) {
      log('ERROR', `Erreur API: ${data.error || 'Unknown error'}`);
      throw new Error(data.error || 'Erreur lors de l\'upload');
    }
    
    log('SUCCESS', `✅ CV analysé - ${data.data?.totalSkills || 0} compétences trouvées`);
    
    return data.data;
  } catch (error) {
    log('ERROR', `❌ Erreur lors de l'upload du CV: ${error}`);
    throw error;
  }
}

export async function getStudentSkills() {
  log('INFO', '🎓 Récupération des compétences étudiant');
  
  try {
    const token = await AsyncStorage.getItem('@jobmatch_token');
    log('INFO', `Token présent: ${token ? 'OUI' : 'NON'}`);
    
    if (!token) {
      return [];
    }
    
    const url = `${API_BASE_URL}/cv/student-skills`;
    log('INFO', `🌐 URL d'appel API: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const duration = Date.now() - startTime;
    
    log('INFO', `⏱️ Temps de réponse: ${duration}ms`);
    log('INFO', `📡 Status HTTP: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    log('INFO', `📦 Réponse brute:`, data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération');
    }
    
    log('SUCCESS', `✅ ${data.skills?.length || 0} compétences récupérées`);
    
    return data.skills || [];
  } catch (error) {
    log('ERROR', `❌ Erreur lors de la récupération des compétences: ${error}`);
    return [];
  }
}