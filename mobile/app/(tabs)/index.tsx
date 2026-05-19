import { StyleSheet, ScrollView, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  swap_expectation: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>TakasCo</ThemedText>
        <TouchableOpacity onPress={() => router.push('/favorites')}>
          <IconSymbol name="heart.fill" size={24} color={Brand.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        {/* Categories */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Kategoriler</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
            {categories.map((cat, i) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryPill, { backgroundColor: theme.backgroundSelected }]}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { categoryId: cat.id, categoryName: cat.name } })}
              >
                <ThemedText style={{ color: theme.text }}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Newest Products */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>En Yeni İlanlar</ThemedText>
          {loading ? (
            <ActivityIndicator size="large" color={Brand.accent} style={{ marginTop: Spacing.four }} />
          ) : (
            <View style={styles.grid}>
              {products.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.productCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  onPress={() => router.push(`/product/${item.id}`)}
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
                    <ThemedText style={styles.productDesc} numberOfLines={1}>Takas beklentisi: {item.swap_expectation}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four, paddingTop: Spacing.eight },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 18 },
  categoryPill: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Radius.full },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  productCard: { width: '47%', borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  imagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: Spacing.three },
  productTitle: { fontWeight: '600', marginBottom: 2 },
  productDesc: { fontSize: 12, opacity: 0.7 }
});
