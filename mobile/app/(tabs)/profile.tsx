import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, getImageUrl } from '@/utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  profile_photo_path?: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    router.replace('/(auth)/welcome');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Profil</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected, overflow: 'hidden' }]}>
            {user?.profile_photo_path ? (
              <Image source={{ uri: getImageUrl(user.profile_photo_path) || undefined }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <IconSymbol name="person.fill" size={40} color={theme.textSecondary} />
            )}
          </View>
          <View>
            {loading ? (
              <ActivityIndicator size="small" color={Brand.accent} />
            ) : user ? (
              <>
                <ThemedText type="subtitle">{user.name}</ThemedText>
                <ThemedText style={{ color: theme.textSecondary }}>{user.email}</ThemedText>
              </>
            ) : (
              <ThemedText type="subtitle">Kullanıcı Bulunamadı</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}
            onPress={() => router.push('/profile-settings')}
          >
            <ThemedText style={{ fontWeight: 'bold' }}>Profil Ayarlarım</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}
            onPress={() => router.push('/my-listings')}
          >
            <ThemedText>İlanlarım</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}
            onPress={() => router.push('/my-trades')}
          >
            <ThemedText>Takaslarım</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}
            onPress={() => router.push('/favorites')}
          >
            <ThemedText>Favorilerim</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}
            onPress={() => router.push('/settings')}
          >
            <ThemedText>Ayarlar</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.cardBg, borderBottomColor: 'transparent', marginTop: Spacing.four }]}
            onPress={handleLogout}
          >
            <ThemedText style={{ color: Brand.danger, fontWeight: 'bold' }}>Çıkış Yap</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  section: { borderRadius: Radius.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.four, borderBottomWidth: 1 }
});
