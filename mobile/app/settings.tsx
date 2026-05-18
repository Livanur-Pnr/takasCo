import { StyleSheet, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 20 }}>Ayarlar</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tercihler</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <ThemedText>Bildirimler</ThemedText>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: Brand.accent }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Hesap</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/change-password')}
            >
              <ThemedText>Şifre Değiştir</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/address')}
            >
              <ThemedText>Adres Bilgilerim</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/privacy-policy')}
            >
              <ThemedText>Gizlilik Politikası</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 14, fontWeight: '600', opacity: 0.7, paddingHorizontal: Spacing.two },
  card: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four },
  divider: { height: 1 }
});
