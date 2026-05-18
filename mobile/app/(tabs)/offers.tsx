import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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

interface Trade {
  id: number;
  status: string;
  sender?: { name: string; phone_number?: string };
  receiver?: { name: string; phone_number?: string };
  offered_product: Product;
  requested_product: Product;
}

export default function OffersScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<Trade[]>([]);
  const [outgoing, setOutgoing] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchTrades();
    }, [])
  );

  const fetchTrades = async () => {
    try {
      const response = await api.get('/trades');
      setIncoming(response.data.incoming || []);
      setOutgoing(response.data.outgoing || []);
    } catch (error) {
      console.error('Teklifler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      const response = await api.post(`/trades/${id}/accept`);
      Alert.alert('Başarılı', response.data.message || 'Teklif kabul edildi!');
      fetchTrades(); // Refresh lists
    } catch (error: any) {
      console.error('Kabul etme hatası:', error.response?.data);
      Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const renderProductImage = (path: string | null) => {
    if (!path) return <IconSymbol name="house.fill" size={24} color={theme.textSecondary} />;
    const parsedPath = path.startsWith('[') ? JSON.parse(path)[0] : path;
    return <Image source={{ uri: getImageUrl(parsedPath) || undefined }} style={{ width: '100%', height: '100%' }} />;
  };

  const renderTrades = (trades: Trade[], isIncoming: boolean) => {
    if (trades.length === 0) {
      return (
        <ThemedView style={[styles.emptyState, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <ThemedText style={{ color: theme.textSecondary }}>
            Henüz {isIncoming ? 'gelen' : 'gönderilen'} bir teklif bulunmuyor.
          </ThemedText>
        </ThemedView>
      );
    }

    return trades.map((trade) => (
      <View key={trade.id} style={[styles.tradeCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.tradeHeader}>
          <ThemedText style={{ fontWeight: 'bold' }}>
            {isIncoming ? `${trade.sender?.name} teklif gönderdi` : `${trade.receiver?.name} kişisine teklif ettiniz`}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: trade.status === 'onaylandı' ? Brand.success + '20' : trade.status === 'reddedildi' ? Brand.danger + '20' : Brand.warning + '20' }]}>
            <ThemedText style={{ fontSize: 10, color: trade.status === 'onaylandı' ? Brand.success : trade.status === 'reddedildi' ? Brand.danger : Brand.warning, fontWeight: 'bold' }}>
              {trade.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.tradeBody}>
          <View style={styles.tradeItem}>
            <ThemedText style={styles.tradeItemLabel}>{isIncoming ? 'Karşı Tarafın Ürünü' : 'Sizin Ürününüz'}</ThemedText>
            <View style={styles.productRow}>
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
                {renderProductImage(trade.offered_product?.image_path)}
              </View>
              <ThemedText style={styles.productTitle} numberOfLines={2}>{trade.offered_product?.title}</ThemedText>
            </View>
          </View>

          <IconSymbol name="arrow.left.arrow.right" size={24} color={theme.textSecondary} style={{ marginHorizontal: Spacing.two }} />

          <View style={styles.tradeItem}>
            <ThemedText style={styles.tradeItemLabel}>{isIncoming ? 'Sizin Ürününüz' : 'Karşı Tarafın Ürünü'}</ThemedText>
            <View style={styles.productRow}>
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
                {renderProductImage(trade.requested_product?.image_path)}
              </View>
              <ThemedText style={styles.productTitle} numberOfLines={2}>{trade.requested_product?.title}</ThemedText>
            </View>
          </View>
        </View>

        {isIncoming && trade.status === 'beklemede' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Brand.accent, flex: 1 }]}
              onPress={() => handleAccept(trade.id)}
            >
              <ThemedText style={styles.buttonText}>Kabul Et</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Tekliflerim</ThemedText>
      </View>

      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'incoming' && { borderBottomColor: Brand.accent, borderBottomWidth: 2 }]} 
          onPress={() => setActiveTab('incoming')}
        >
          <ThemedText style={{ fontWeight: activeTab === 'incoming' ? 'bold' : 'normal', color: activeTab === 'incoming' ? theme.text : theme.textSecondary }}>Gelen Teklifler</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'outgoing' && { borderBottomColor: Brand.accent, borderBottomWidth: 2 }]} 
          onPress={() => setActiveTab('outgoing')}
        >
          <ThemedText style={{ fontWeight: activeTab === 'outgoing' ? 'bold' : 'normal', color: activeTab === 'outgoing' ? theme.text : theme.textSecondary }}>Giden Teklifler</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.four }}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.accent} style={{ marginTop: Spacing.eight }} />
        ) : (
          renderTrades(activeTab === 'incoming' ? incoming : outgoing, activeTab === 'incoming')
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, padding: Spacing.four, alignItems: 'center' },
  emptyState: { padding: Spacing.six, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.six },
  tradeCard: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.four, gap: Spacing.three },
  tradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  statusBadge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.full },
  tradeBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tradeItem: { flex: 1, gap: Spacing.two },
  tradeItemLabel: { fontSize: 12, opacity: 0.7 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  imagePlaceholder: { width: 48, height: 48, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productTitle: { fontSize: 14, fontWeight: '500', flex: 1 },
  actionButtons: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  button: { padding: Spacing.three, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
