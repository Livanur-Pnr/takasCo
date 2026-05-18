import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api } from '@/utils/api';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      Alert.alert('Uyarı', 'Yeni şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation
      });

      Alert.alert('Başarılı', response.data.message || 'Şifreniz başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
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
        <ThemedText type="title" style={{ fontSize: 20 }}>Şifre Değiştir</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.four, gap: Spacing.six }}>
        <ThemedText style={{ opacity: 0.7 }}>
          Hesabınızın güvenliğini sağlamak için lütfen mevcut şifrenizi ve yeni şifrenizi girin. Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.
        </ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Eski Şifre</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="Mevcut şifrenizi girin" 
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Yeni Şifre</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="Yeni şifrenizi girin" 
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Yeni Şifre (Tekrar)</ThemedText>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} 
              placeholder="Yeni şifrenizi tekrar girin" 
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={newPasswordConfirmation}
              onChangeText={setNewPasswordConfirmation}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer / Submit Button */}
      <View style={[styles.footer, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: loading ? theme.backgroundSelected : Brand.accent }]}
          disabled={loading}
          onPress={handleChangePassword}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Şifremi Değiştir</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, paddingTop: Spacing.eight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  form: { gap: Spacing.four, marginTop: Spacing.two },
  inputContainer: { gap: Spacing.one },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, padding: Spacing.three, borderRadius: Radius.sm, fontSize: 16 },
  footer: { padding: Spacing.four, paddingBottom: Spacing.six, borderTopWidth: 1 },
  button: { padding: Spacing.four, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
