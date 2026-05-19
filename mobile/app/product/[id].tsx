import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Dimensions, Modal, SafeAreaView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
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
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fullscreen Image Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const modalScrollRef = useRef<ScrollView>(null);

  const loadUserData = async () => {
    try {
      const userString = await SecureStore.getItemAsync('user'); 
      if (userString) {
        const userData = JSON.parse(userString);
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
    loadUserData();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
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
        { text: "Vazgeç", style: "cancel" },
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalVisible(true);
    // Modal açıldığında doğru fotoğrafa kaydır
    setTimeout(() => {
      modalScrollRef.current?.scrollTo({ x: index * screenWidth, animated: false });
    }, 100);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </ThemedView>
    );
  }

  if (!product) return null;

  const isOwner = currentUserId === product.user_id;

  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : product.image_path 
      ? [{ id: 'primary', image_path: product.image_path.startsWith('[') ? JSON.parse(product.image_path)[0] : product.image_path }]
      : [];

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
          
          {imagesList.length > 0 ? (
            <View>
              <ScrollView 
                ref={scrollRef}
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false} 
                style={{ width: screenWidth, height: 300 }}
                onMomentumScrollEnd={handleScroll}
              >
                {imagesList.map((img: any, index: number) => (
                  <TouchableOpacity activeOpacity={0.9} key={img.id} onPress={() => openImageModal(index)}>
                    <Image source={{ uri: getImageUrl(img.image_path) || undefined }} style={{ width: screenWidth, height: 300, resizeMode: 'cover' }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Pagination Dots */}
              {imagesList.length > 1 && (
                <View style={styles.paginationContainer}>
                  {imagesList.map((_: any, index: number) => (
                    <View 
                      key={index} 
                      style={[
                        styles.dot, 
                        { backgroundColor: index === currentImageIndex ? Brand.accent : 'rgba(255,255,255,0.5)' }
                      ]} 
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <IconSymbol name="house.fill" size={64} color={theme.textSecondary} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={{ fontSize: 24, flex: 1 }} numberOfLines={2}>{product.title}</ThemedText>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
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

      {/* Fullscreen Image Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={[styles.closeButton, { top: Math.max(insets.top, 20) }]} 
            onPress={() => setIsModalVisible(false)}
          >
            <IconSymbol name="xmark" size={30} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView 
            ref={modalScrollRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {imagesList.map((img: any) => (
              <View key={img.id} style={{ width: screenWidth, height: screenHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Image 
                  source={{ uri: getImageUrl(img.image_path) || undefined }} 
                  style={{ width: screenWidth, height: screenHeight, resizeMode: 'contain' }} 
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Fullscreen Pagination Dots */}
          {imagesList.length > 1 && (
            <View style={[styles.paginationContainer, { bottom: 40 }]}>
              {imagesList.map((_: any, index: number) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    { backgroundColor: index === currentImageIndex ? Brand.accent : 'rgba(255,255,255,0.5)' }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagePlaceholder: { height: 300, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: Spacing.four, padding: Spacing.two, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: Radius.full, zIndex: 10 },
  paginationContainer: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontWeight: '600', fontSize: 16 },
  description: { lineHeight: 24 },
  swapExpectation: { padding: Spacing.four, borderRadius: Radius.md, gap: Spacing.two },
  ownerCard: { padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
  ownerAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: Spacing.four, paddingBottom: Spacing.six, borderTopWidth: 1 },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeButton: { position: 'absolute', right: 20, zIndex: 100, padding: 10 }
});