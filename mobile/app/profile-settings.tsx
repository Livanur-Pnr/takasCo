import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, getImageUrl } from '@/utils/api';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  
  // newPhoto tutulurken ImagePicker Asset objesi tutulur
  const [newPhoto, setNewPhoto] = useState<any>(null); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      const user = response.data;
      setName(user.name || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
      setExistingPhoto(user.profile_photo_path || null);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Fotoğraf seçmek için galeri erişim iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Profil fotoğrafı için kare
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewPhoto(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!name || !email || !phoneNumber) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone_number', phoneNumber);

      if (newPhoto) {
        const filename = newPhoto.fileName || newPhoto.uri.split('/').pop() || 'profile.jpg';
        const type = newPhoto.mimeType || 'image/jpeg';

        // @ts-ignore
        formData.append('profile_photo', {
          uri: Platform.OS === 'ios' ? newPhoto.uri.replace('file://', '') : newPhoto.uri,
          name: filename,
          type,
        } as any);
      }

      const response = await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local storage just in case
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Profil güncellenirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 20 }}>Profil Ayarlarım</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        
        {/* Photo Upload Section */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={pickImage} style={[styles.photoBox, { borderColor: theme.border, backgroundColor: theme.backgroundSelected }]}>
            {newPhoto ? (
              <Image source={{ uri: newPhoto.uri }} style={styles.photo} />
            ) : existingPhoto ? (
              <Image source={{ uri: getImageUrl(existingPhoto) || undefined }} style={styles.photo} />
            ) : (
              <IconSymbol name="camera.fill" size={40} color={theme.textSecondary} />
            )}
            <View style={[styles.editIconContainer, { backgroundColor: Brand.accent }]}>
              <IconSymbol name="pencil" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText style={{ marginTop: Spacing.two, opacity: 0.7, fontSize: 14 }}>
            Fotoğrafı Değiştir
          </ThemedText>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Ad Soyad (Nickname)</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="Adınız Soyadınız" 
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Telefon Numarası</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="5XX XXX XX XX" 
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>E-posta Adresi</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="E-posta adresiniz" 
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

      </ScrollView>

      {/* Footer / Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: saving ? theme.backgroundSelected : Brand.accent }]}
          disabled={saving}
          onPress={handleSave}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Kaydet</ThemedText>
          )}
        </TouchableOpacity>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoContainer: { alignItems: 'center', marginVertical: Spacing.four },
  photoBox: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 2, position: 'relative' },
  photo: { width: '100%', height: '100%', borderRadius: 60 },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  form: { gap: Spacing.four },
  inputContainer: { gap: Spacing.one },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, padding: Spacing.three, borderRadius: Radius.sm, fontSize: 16 },
  footer: { padding: Spacing.four, paddingBottom: Spacing.six, borderTopWidth: 1 },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
