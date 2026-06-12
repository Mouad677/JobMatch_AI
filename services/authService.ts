// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export async function login(email: string, password: string) {
  console.log('Login attempt for:', email);
  
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response);
    
    if (response.token) {
      api.setToken(response.token);
      
      if (response.user) {
        await AsyncStorage.setItem('@jobmatch_user', JSON.stringify(response.user));
      }
      
      if (response.profile) {
        await AsyncStorage.setItem('@jobmatch_profile', JSON.stringify(response.profile));
      }
      
      return response;
    }
    
    // Si pas de token, c'est une erreur
    throw new Error(response.message || 'Erreur de connexion');
  } catch (error: any) {
    console.error('Login service error:', error);
    // Propager l'erreur pour qu'elle soit capturée dans AuthContext
    throw error;
  }
}

export async function register(userData: any) {
  console.log('Register attempt for:', userData.email);
  
  try {
    const response = await api.post('/auth/register', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber || '',
      fieldOfStudy: userData.fieldOfStudy,
      currentLevel: userData.currentLevel
    });
    
    console.log('Register response:', response);
    
    if (response.token) {
      api.setToken(response.token);
      await AsyncStorage.setItem('@jobmatch_user', JSON.stringify(response.user));
      if (response.studentProfile) {
        await AsyncStorage.setItem('@jobmatch_profile', JSON.stringify(response.studentProfile));
      }
    }
    
    return response;
  } catch (error) {
    console.error('Register service error:', error);
    throw error;
  }
}

export async function logout() {
  console.log('Logout attempt');
  
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.log('Logout API error (ignored):', error);
  } finally {
    api.clearToken();
    await AsyncStorage.removeItem('@jobmatch_user');
    await AsyncStorage.removeItem('@jobmatch_token');
    await AsyncStorage.removeItem('@jobmatch_profile');
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}