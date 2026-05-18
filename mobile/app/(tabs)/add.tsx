import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, API_BASE_URL } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';

interface Category {
  id: number;
  name: string;
}

export default function AddScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Sıfır');
  const [swapExpectation, setSwapExpectation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler alınamadı:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets].slice(0, 3));
    }
  };

  const handlePublish = async () => {
    if (!title || images.length === 0 || !selectedCategory || !swapExpectation || !description) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun ve en az bir fotoğraf ekleyin.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category_id', selectedCategory.toString());
      formData.append('description', description);
      formData.append('condition', condition);
      formData.append('swap_expectation', swapExpectation);

      images.forEach((asset, index) => {
        const filename = asset.fileName || asset.uri.split('/').pop() || `upload_${index}.jpg`;
        const type = asset.mimeType || 'image/jpeg';

        // @ts-ignore
        formData.append('images[]', {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: filename,
          type,
        } as any);
      });

      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      Alert.alert('Başarılı', 'İlanınız onaya gönderildi!');
      router.push('/(tabs)');
      
      // Reset form
      setImages([]);
      setTitle('');
      setDescription('');
      setSwapExpectation('');
      setSelectedCategory(null);
    } catch (error: any) {
      console.log('Error payload:', error.response?.data);
      let errorMessage = 'İlan gönderilirken bir hata oluştu.';
      
      if (error.response?.data?.errors) {
        // Extract validation errors from Laravel
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>İlan Ekle</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        <View style={styles.imageGallery}>
          {images.map((img, index) => (
            <View key={index} style={[styles.imageUpload, { backgroundColor: theme.backgroundSelected, borderColor: theme.border, width: 100, height: 100 }]}>
              <Image source={{ uri: img.uri }} style={styles.uploadedImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setImages(images.filter((_, i) => i !== index))}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={Brand.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity 
              style={[styles.imageUpload, { backgroundColor: theme.backgroundSelected, borderColor: theme.border, width: 100, height: 100 }]}
              onPress={pickImage}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.two, fontSize: 10 }}>Fotoğraf Ekle</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Başlık *</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
            placeholder="Ne takaslıyorsun?" 
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Kategori *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryPill, { backgroundColor: selectedCategory === cat.id ? Brand.accent : theme.backgroundSelected }]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <ThemedText style={{ color: selectedCategory === cat.id ? '#fff' : theme.text }}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Ürün Durumu</ThemedText>
          <View style={styles.segmentedControl}>
            {['Sıfır', 'Az Kullanılmış', 'Eskimiş'].map((cond) => (
              <TouchableOpacity 
                key={cond} 
                style={[styles.segment, condition === cond ? { backgroundColor: Brand.accent } : { backgroundColor: theme.backgroundSelected }]}
                onPress={() => setCondition(cond)}
              >
                <ThemedText style={{ color: condition === cond ? '#fff' : theme.text, fontSize: 12 }}>{cond}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Açıklama *</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, height: 100 }]} 
            placeholder="Ürünün durumu, özellikleri vs." 
            placeholderTextColor={theme.textSecondary}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Takas Beklentisi *</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
            placeholder="Buna karşılık ne istiyorsun?" 
            placeholderTextColor={theme.textSecondary}
            value={swapExpectation}
            onChangeText={setSwapExpectation}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: loading ? theme.backgroundSelected : Brand.accent }]} 
          onPress={handlePublish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>İlanı Yayınla</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight },
  imageGallery: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' },
  imageUpload: { borderRadius: Radius.md, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12 },
  uploadedImage: { width: '100%', height: '100%' },
  inputGroup: { gap: Spacing.two },
  label: { fontWeight: '600', fontSize: 14 },
  input: { borderWidth: 1, padding: Spacing.three, borderRadius: Radius.sm, fontSize: 16 },
  categoryPill: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderRadius: Radius.full },
  segmentedControl: { flexDirection: 'row', gap: Spacing.two },
  segment: { flex: 1, padding: Spacing.three, borderRadius: Radius.sm, alignItems: 'center' },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center', marginTop: Spacing.four },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
