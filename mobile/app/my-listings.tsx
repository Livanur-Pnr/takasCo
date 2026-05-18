import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
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
  status: number;
}

export default function MyListingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProducts();
    console.log("bu ekran")

  }, []);
  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/user/products');
      console.log("ashdjhasdsad", response?.data)
      setProducts(response.data);
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 20 }}>İlanlarım</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.four, flexGrow: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.accent} style={{ marginTop: Spacing.eight }} />
        ) : products.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.eight }}>
            <IconSymbol name="doc.text.magnifyingglass" size={64} color={theme.textSecondary} />
            <ThemedText style={{ marginTop: Spacing.four, textAlign: 'center', color: theme.textSecondary }}>Henüz bir ilanınız bulunmamaktadır.</ThemedText>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: Brand.accent }]}
              onPress={() => router.push('/(tabs)/add')}
            >
              <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>İlan Ekle</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((item) => (
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
                <View style={[
                  styles.statusBadge, 
                  { 
                    backgroundColor: item.status === 1 ? Brand.success + '20' : 
                                     item.status === 3 ? Brand.accent + '20' : 
                                     Brand.warning + '20' 
                  }
                ]}>
                  <ThemedText style={{ 
                    fontSize: 10, 
                    fontWeight: 'bold',
                    color: item.status === 1 ? Brand.success : 
                           item.status === 3 ? Brand.accent : 
                           Brand.warning 
                  }}>
                    {item.status === 1 ? 'Yayında' : item.status === 3 ? 'Takaslandı' : 'Onay Bekliyor'}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productCard: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  imagePlaceholder: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: Spacing.three, flex: 1 },
  productTitle: { fontWeight: '600', marginBottom: 2 },
  productDesc: { fontSize: 12, opacity: 0.7, marginBottom: Spacing.two },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.full },
  addButton: { marginTop: Spacing.six, paddingHorizontal: Spacing.six, paddingVertical: Spacing.three, borderRadius: Radius.full }
});
