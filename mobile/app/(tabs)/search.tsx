import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  category_id: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ categoryId?: string, categoryName?: string }>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      filterProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, params.categoryId, products]);

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

  const filterProducts = () => {
    let result = products;
    
    // Kategoriye göre filtrele
    if (params.categoryId) {
      result = result.filter(p => p.category_id === Number(params.categoryId));
    }
    
    // Arama metnine göre filtrele
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(query) || p.swap_expectation.toLowerCase().includes(query));
    }
    
    setFilteredProducts(result);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          {params.categoryId && (
            <TouchableOpacity 
              onPress={() => {
                router.setParams({ categoryId: '', categoryName: '' });
                router.push('/(tabs)');
              }}
              style={{ padding: Spacing.two }}
            >
              <IconSymbol name="chevron.left" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          <ThemedText type="title" style={{ fontSize: 24 }}>Keşfet</ThemedText>
        </View>
        {params.categoryName && (
          <TouchableOpacity 
            style={{ backgroundColor: Brand.accent + '20', paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: Radius.full }}
            onPress={() => router.setParams({ categoryId: '', categoryName: '' })}
          >
            <ThemedText style={{ color: Brand.accent, fontSize: 12, fontWeight: 'bold' }}>{params.categoryName} ✕</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ padding: Spacing.four }}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={theme.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: theme.text }]} 
            placeholder="Ürün ara..." 
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.accent} style={{ marginTop: Spacing.eight }} />
        ) : filteredProducts.length === 0 ? (
          <View style={{ alignItems: 'center', padding: Spacing.eight }}>
            <IconSymbol name="magnifyingglass" size={48} color={theme.textSecondary} />
            <ThemedText style={{ marginTop: Spacing.four, color: theme.textSecondary }}>Sonuç bulunamadı.</ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((item) => (
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
                  <ThemedText style={styles.productDesc} numberOfLines={1}>Takas: {item.swap_expectation}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.sm, borderWidth: 1, gap: Spacing.two },
  searchInput: { flex: 1, fontSize: 16, height: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  productCard: { width: '47%', borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  imagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: Spacing.three },
  productTitle: { fontWeight: '600', marginBottom: 2 },
  productDesc: { fontSize: 12, opacity: 0.7 }
});
