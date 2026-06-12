// contexts/AuthContext.tsx
import * as authService from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'pedagogic_director' | 'admin';
};

type Student = User & {
  studentId: string;
  fieldOfStudy: string;
  currentLevel: string;
  enrolledYear: number;
  graduationYear: number;
};

type AuthContextType = {
  user: User | null;
  student: Student | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@jobmatch_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        const storedProfile = await AsyncStorage.getItem('@jobmatch_profile');
        if (storedProfile) {
          setStudent(JSON.parse(storedProfile));
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const response = await authService.login(email, password);
      
      console.log('Login response:', response);
      
      if (response.user) {
        setUser(response.user as User);
        const profile = response.profile ?? response.studentProfile;
        if (profile && response.user.role === 'student') {
          setStudent({ ...response.user, ...profile } as Student);
        }
        
        // Sauvegarder dans AsyncStorage
        await AsyncStorage.setItem('@jobmatch_user', JSON.stringify(response.user));
        if (profile) {
          await AsyncStorage.setItem('@jobmatch_profile', JSON.stringify(profile));
        }
        if (response.token) {
          await AsyncStorage.setItem('@jobmatch_token', response.token);
        }
        
        return { success: true, user: response.user };
      }
      
      return { success: false, message: response.message || 'Email ou mot de passe incorrect' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Email ou mot de passe incorrect' };
    }
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    setUser(response.user);
    if (response.studentProfile) {
      setStudent(response.studentProfile);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout service error:', error);
    } finally {
      setUser(null);
      setStudent(null);
      await AsyncStorage.removeItem('@jobmatch_user');
      await AsyncStorage.removeItem('@jobmatch_profile');
      await AsyncStorage.removeItem('@jobmatch_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}