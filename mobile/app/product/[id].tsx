import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store'; // SecureStore eklendi
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, getImageUrl } from '@/utils/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Giriş yapan kullanıcı ID'si

  const loadUserData = async () => {
    try {
      const userString = await SecureStore.getItemAsync('user'); 
      console.log("Giriş Yapan Verisi:", userString);

      if (userString) {
        const userData = JSON.parse(userString);
        setCurrentUserId(userData.id); // Artık userData.id dolu gelecek!
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
    loadUserData(); // Kullanıcı verisini yükle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      console.log("responseresponseresponse",response.data)
      setProduct(response.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Ürün bilgileri alınamadı.');
      router.back();
    } finally {
      setLoading(false);
    }
  };
  

  const toggleFavorite = async () => {
    try {
      const response = await api.post(`/products/${id}/favorite`);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.log('Favori hatası', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "İlanı Sil",
      "Bu ilanı silmek istediğinize emin misiniz?",
      [
        { 
          text: "Vazgeç", 
          style: "cancel" 
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/products/${id}`);
              Alert.alert("Başarılı", "İlanınız silindi.");
              router.replace('/(tabs)');
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert("Hata", "İlan silinirken bir sorun oluştu.");
            }
          }
        }
      ]
    );
  };


  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </ThemedView>
    );
  }

  if (!product) return null;

  // Yetkilendirme Kontrolü
  const isOwner = currentUserId === product.user_id;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={[styles.backButton, { top: Math.max(insets.top, 20) + 10 }]}
          >
            <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          {product.image_path ? (
            <Image source={{ uri: getImageUrl(product.image_path.startsWith('[') ? JSON.parse(product.image_path)[0] : product.image_path) || undefined }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <IconSymbol name="house.fill" size={64} color={theme.textSecondary} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={{ fontSize: 24, flex: 1 }} numberOfLines={2}>{product.title}</ThemedText>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
              {/* Silme Butonu: Sadece ilan sahibi için favori butonunun yanında */}
              {isOwner && (
                <TouchableOpacity onPress={handleDelete} style={{ padding: Spacing.two }}>
                  <IconSymbol name="trash.fill" size={24} color={Brand.danger} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={toggleFavorite} style={{ padding: Spacing.two }}>
                <IconSymbol name="heart.fill" size={28} color={isFavorite ? Brand.danger : theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'center', flexWrap: 'wrap' }}>
            <ThemedText style={[styles.category, { color: Brand.accent }]}>{product.category?.name || 'Kategori Yok'}</ThemedText>
            <View style={{ backgroundColor: theme.backgroundSelected, paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.sm }}>
              <ThemedText style={{ fontSize: 12 }}>Durum: {product.condition}</ThemedText>
            </View>
            {(product.city || product.district) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.backgroundSelected, paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.sm }}>
                <ThemedText style={{ fontSize: 12 }}>📍</ThemedText>
                <ThemedText style={{ fontSize: 12 }}>
                  {product.city}{product.city && product.district ? ', ' : ''}{product.district}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.description}>{product.description}</ThemedText>

          <View style={[styles.swapExpectation, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="defaultSemiBold">Takas Beklentisi:</ThemedText>
            <ThemedText>{product.swap_expectation}</ThemedText>
          </View>

          <View style={[styles.ownerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.ownerAvatar, { backgroundColor: theme.backgroundSelected }]}>
              <IconSymbol name="person.fill" size={24} color={theme.textSecondary} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">{product.user?.name}</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Sistem Kullanıcısı</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
      

      {/* Sadece başkasına ait ürünlerde 'Takas Teklif Et' butonu görünür */}
      {!isOwner && (
        <View style={[styles.footer, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Brand.accent }]}
            onPress={() => router.push(`/product/${id}/offer`)}
          >
            <ThemedText style={styles.buttonText}>Takas Teklif Et</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagePlaceholder: { height: 300, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', left: Spacing.four, padding: Spacing.two, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: Radius.full, zIndex: 10 },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontWeight: '600', fontSize: 16 },
  description: { lineHeight: 24 },
  swapExpectation: { padding: Spacing.four, borderRadius: Radius.md, gap: Spacing.two },
  ownerCard: { padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
  ownerAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: Spacing.four, paddingBottom: Spacing.six, borderTopWidth: 1 },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});