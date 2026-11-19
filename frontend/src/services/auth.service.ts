import {
  api,
  getStoredToken,
  setStoredToken,
  deleteStoredToken,
} from '../api/client';

import {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  User,
} from '../types/auth';

export const login = async (
  data: LoginDTO
): Promise<AuthResponse> => {
  const response = await api.post('/auth/login/', data);

  const auth = response.data;

  await setStoredToken('accessToken', auth.accessToken);
  await setStoredToken('refreshToken', auth.refreshToken);

  return auth;
};

export const register = async (
  data: RegisterDTO
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register/', data);

  const auth = response.data;

  await setStoredToken('accessToken', auth.accessToken);
  await setStoredToken('refreshToken', auth.refreshToken);

  return auth;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me/');

  return response.data;
};

export const logout = async () => {
  await deleteStoredToken('accessToken');
  await deleteStoredToken('refreshToken');
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const currentRefreshToken = await getStoredToken('refreshToken');
  if (!currentRefreshToken) {
    return null;
  }

  const response = await api.post('/auth/refresh/', {
    refreshToken: currentRefreshToken,
  });

  const { accessToken, refreshToken: newRefreshToken } = response.data;

  if (accessToken) {
    await setStoredToken('accessToken', accessToken);
  }
  if (newRefreshToken) {
    await setStoredToken('refreshToken', newRefreshToken);
  }

  return accessToken;
};
