import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
//React Native / Expo) tarafı ile backend (Laravel API) tarafını birbirine bağlayan API İletişim ve Oturum Yönetimi (Axios Servisi) katmanı
// Android Emulator için 10.0.2.2, iOS ve Web için 127.0.0.1 kullanılır.
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
const BASE_URL = `${API_BASE_URL}/api`;

export const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}/storage/${path}`;
};

export const api = create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Her istekte otomatik çalışacak aracı (Interceptor)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token okuma hatası:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Login veya register isteklerinde 401 dönerse (örn: yanlış şifre), interceptor'ı atla
    const isAuthRequest = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      console.warn(`Oturum süresi doldu veya yetkisiz erişim (${error.config?.url}), çıkış yapılıyor...`);
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user');
      router.replace('/(auth)/welcome');
    }
    return Promise.reject(error);
  }
);
