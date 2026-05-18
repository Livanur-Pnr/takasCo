import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, getImageUrl } from '@/utils/api';

interface Product {
  id: number;
  title: string;
  image_path: string | null;
}

export default function OfferScreen() {
  const { id } = useLocalSearchParams(); // requested_product_id
  const router = useRouter();
  const theme = useTheme();
  
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/user/products');
      setMyProducts(response.data);
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'İlanlarınız yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      await api.post('/trades', {
        offered_product_id: selectedProduct,
        requested_product_id: Number(id)
      });
      
      Alert.alert('Başarılı', 'Takas teklifiniz başarıyla gönderildi!', [
        { text: 'Tamam', onPress: () => router.replace('/(tabs)/offers') }
      ]);
    } catch (error: any) {
      console.error('Teklif gönderim hatası:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Teklif gönderilirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 20 }}>Teklif Gönder</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
          Bu ürüne karşılık ne teklif ediyorsun?
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginTop: -Spacing.four }}>
          Takas etmek istediğiniz kendi ürününüzü seçin.
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color={Brand.accent} style={{ marginTop: Spacing.four }} />
        ) : myProducts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: Spacing.four }}>
            <IconSymbol name="doc.text.magnifyingglass" size={48} color={theme.textSecondary} />
            <ThemedText style={{ marginTop: Spacing.two, color: theme.textSecondary }}>
              Takas teklif edebileceğiniz bir ilanınız yok.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {myProducts.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.productCard, 
                  { backgroundColor: theme.cardBg, borderColor: selectedProduct === item.id ? Brand.accent : theme.border },
                  selectedProduct === item.id && { borderWidth: 2 }
                ]}
                onPress={() => setSelectedProduct(item.id)}
              >
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
                  {item.image_path ? (
                    <Image 
                      source={{ uri: getImageUrl(item.image_path.startsWith('[') ? JSON.parse(item.image_path)[0] : item.image_path) || undefined }} 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  ) : (
                    <IconSymbol name="house.fill" size={32} color={theme.textSecondary} />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productTitle} numberOfLines={1}>{item.title}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: selectedProduct ? Brand.accent : theme.backgroundSelected }]}
          disabled={!selectedProduct || submitting}
          onPress={handleSendOffer}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={[styles.buttonText, { color: selectedProduct ? '#fff' : theme.textSecondary }]}>Teklifi Gönder</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { gap: Spacing.four },
  productCard: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  imagePlaceholder: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: Spacing.three, flex: 1 },
  productTitle: { fontWeight: '600' },
  footer: { padding: Spacing.four, paddingBottom: Spacing.six, borderTopWidth: 1 },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 }
});
