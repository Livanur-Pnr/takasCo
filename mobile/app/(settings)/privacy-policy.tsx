import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 20 }}>Gizlilik Politikası</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>1. Veri Toplama</ThemedText>
        <ThemedText style={[styles.paragraph, { color: theme.textSecondary }]}>
          Uygulamamızı kullandığınızda isim, e-posta adresi, telefon numarası ve profil fotoğrafı gibi kişisel verilerinizi toplamaktayız. Bu bilgiler tamamen sizlere daha iyi bir takas deneyimi sunmak amacıyla kullanılmaktadır.
        </ThemedText>

        <ThemedText style={styles.title}>2. Verilerin Kullanımı</ThemedText>
        <ThemedText style={[styles.paragraph, { color: theme.textSecondary }]}>
          Toplanan verileriniz, uygulama içerisindeki işlemlerin yürütülmesi (örneğin: takas teklifleri oluşturma, ürün listeleme) ve gerektiğinde tarafınızla iletişime geçilmesi için kullanılmaktadır. Üçüncü şahıslarla reklam veya pazarlama amacıyla paylaşılmaz.
        </ThemedText>

        <ThemedText style={styles.title}>3. Veri Güvenliği</ThemedText>
        <ThemedText style={[styles.paragraph, { color: theme.textSecondary }]}>
          Kullanıcı verilerinizin güvenliği bizim için son derece önemlidir. Sunucularımıza iletilen tüm veriler şifrelenerek korunur. Hesabınızın güvenliği için kullandığınız şifreleri başkalarıyla paylaşmamaya özen gösteriniz.
        </ThemedText>

        <ThemedText style={styles.title}>4. Değişiklikler ve İletişim</ThemedText>
        <ThemedText style={[styles.paragraph, { color: theme.textSecondary }]}>
          TakasCo uygulaması, işbu gizlilik politikasında zaman zaman güncellemeler yapma hakkını saklı tutar. Politikadaki olası değişiklikler uygulama üzerinden sizlere bildirilecektir.
        </ThemedText>

        <View style={{ height: Spacing.eight }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  title: { fontSize: 16, fontWeight: 'bold', marginTop: Spacing.four },
  paragraph: { fontSize: 14, lineHeight: 22 }
});
