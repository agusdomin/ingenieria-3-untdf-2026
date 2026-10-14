import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const getStoredToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return await SecureStore.getItemAsync(key);
};

export const setStoredToken = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

export const deleteStoredToken = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        'API error:',
        error.response.status,
        error.response.data
      );
    } else {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);