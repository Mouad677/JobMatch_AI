import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export type LoginResponse = {
  success?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'pedagogic_director' | 'admin';
  };
  profile?: Record<string, unknown>;
  studentProfile?: Record<string, unknown>;
};

const DEMO_PASSWORD = '123456';

const DEMO_ACCOUNTS: Record<
  string,
  { user: LoginResponse['user']; profile?: LoginResponse['profile'] }
> = {
  'etudiant@test.com': {
    user: {
      id: 'demo-student-1',
      email: 'etudiant@test.com',
      firstName: 'Ahmed',
      lastName: 'Benali',
      role: 'student',
    },
    profile: {
      studentId: 'STU001',
      fieldOfStudy: 'Informatique',
      currentLevel: 'BAC+5',
      enrolledYear: 2022,
      graduationYear: 2026,
    },
  },
  'directeur@test.com': {
    user: {
      id: 'demo-director-1',
      email: 'directeur@test.com',
      firstName: 'Fatima',
      lastName: 'Alaoui',
      role: 'pedagogic_director',
    },
  },
};

function tryDemoLogin(email: string, password: string): LoginResponse | null {
  const key = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS[key];
  if (!account || password !== DEMO_PASSWORD) {
    return null;
  }
  return {
    success: true,
    token: `demo-token-${account.user!.id}`,
    user: account.user,
    profile: account.profile,
  };
}

async function persistLogin(response: LoginResponse) {
  if (response.token) {
    api.setToken(response.token);
  }
  if (response.user) {
    await AsyncStorage.setItem('@jobmatch_user', JSON.stringify(response.user));
  }
  const profile = response.profile ?? response.studentProfile;
  if (profile) {
    await AsyncStorage.setItem('@jobmatch_profile', JSON.stringify(profile));
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const demo = tryDemoLogin(email, password);
  if (demo) {
    await persistLogin(demo);
    return demo;
  }

  try {
    const response = (await api.post('/auth/login', {
      email: email.trim(),
      password,
    })) as LoginResponse;
    await persistLogin(response);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Impossible de se connecter au serveur';
    throw new Error(
      message.includes('JSON') || message.includes('fetch') || message.includes('Network')
        ? 'Serveur inaccessible. Utilisez les comptes démo (etudiant@test.com / directeur@test.com, mot de passe 123456).'
        : message,
    );
  }
}

export async function register(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  fieldOfStudy: string;
  currentLevel: string;
}) {
  const response = (await api.post('/auth/register', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    phoneNumber: userData.phoneNumber || '',
    fieldOfStudy: userData.fieldOfStudy,
    currentLevel: userData.currentLevel,
  })) as LoginResponse;

  await persistLogin(response);
  return response;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore when offline or demo mode
  } finally {
    api.clearToken();
    await AsyncStorage.multiRemove([
      '@jobmatch_user',
      '@jobmatch_token',
      '@jobmatch_profile',
    ]);
  }
}

export async function getCurrentUser() {
  try {
    return await api.get('/auth/me');
  } catch {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Record<string, unknown>) {
  return api.put(`/users/${userId}`, data);
}
