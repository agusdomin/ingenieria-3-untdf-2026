import * as SecureStore from 'expo-secure-store';

import { api } from '../api/client';

import {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  User,
} from '../types/auth';

export const login = async (
  data: LoginDTO
): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);

  const auth = response.data;

  await SecureStore.setItemAsync(
    'accessToken',
    auth.accessToken
  );

  await SecureStore.setItemAsync(
    'refreshToken',
    auth.refreshToken
  );

  return auth;
};

export const register = async (
  data: RegisterDTO
): Promise<AuthResponse> => {
  const response = await api.post(
    '/auth/register',
    data
  );

  return response.data;
};

export const getCurrentUser =
  async (): Promise<User> => {
    const response = await api.get('/auth/me');

    return response.data;
  };

export const logout = async () => {
  await SecureStore.deleteItemAsync(
    'accessToken'
  );

  await SecureStore.deleteItemAsync(
    'refreshToken'
  );
};