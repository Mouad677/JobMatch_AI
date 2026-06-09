// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration de l'URL de l'API
const getBaseUrl = () => {
  if (__DEV__) {
    // Pour Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    // Pour iOS Simulator ou Web
    return 'http://localhost:3000/api';
  }
  return 'https://api.jobmatch-ai.com/api';
};

const API_BASE_URL = getBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Pour déboguer

class ApiClient {
  private token: string | null = null;

  async init() {
    try {
      this.token = await AsyncStorage.getItem('@jobmatch_token');
      console.log('Token loaded:', this.token ? 'Yes' : 'No');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  setToken(token: string) {
    this.token = token;
    AsyncStorage.setItem('@jobmatch_token', token).catch(console.error);
  }

  async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('@jobmatch_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data: Record<string, unknown> = {};
      if (text) {
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          throw new Error(
            response.ok
              ? 'Réponse serveur invalide'
              : 'Serveur inaccessible. Vérifiez que le backend tourne ou utilisez un compte démo.',
          );
        }
      }

      console.log('API Response:', response.status, data);

      if (!response.ok) {
        throw new Error(
          (typeof data.message === 'string' && data.message) ||
            `Erreur serveur (${response.status})`,
        );
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof TypeError) {
        throw new Error(
          'Impossible de joindre le serveur. Utilisez les comptes démo affichés sur l’écran de connexion.',
        );
      }
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Initialiser le token au démarrage
api.init().catch(console.error);