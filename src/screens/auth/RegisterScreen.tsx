import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TranslationKey } from '../../i18n/translations';

type Props = { navigation: any };

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setErrorKey(null);
    if (password !== confirm) { setErrorKey('auth.passwordsMismatch'); return; }
    if (password.length < 6) { setErrorKey('auth.passwordTooShort'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e: any) {
      setErrorKey(e.message as TranslationKey);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>{t('auth.createAccount')}</Text>
            <Text style={styles.subtitle}>{t('auth.joinSubtitle')}</Text>

            {errorKey && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{t(errorKey)}</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>{t('auth.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.namePlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordMinPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.fieldLabel}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.repeatPassword')}
              placeholderTextColor={Colors.inkMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <View style={{ height: Spacing.sm }} />

            {loading
              ? <ActivityIndicator color={Colors.ink} />
              : <Button label={t('auth.createAccount')} onPress={handleRegister} fullWidth />
            }
          </View>

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>{t('auth.alreadyHaveAccount')} </Text>
            <Text style={styles.switchLink}>{t('auth.logIn')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, padding: Spacing.md, paddingTop: Spacing.xl },
  backRow: { marginBottom: Spacing.lg },
  backText: { ...Typography.body, fontSize: 14, fontWeight: '500' },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  title: { ...Typography.h2, marginBottom: 4 },
  subtitle: { ...Typography.body, marginBottom: Spacing.lg },
  errorBox: {
    backgroundColor: Colors.tag.alert.bg, borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  errorText: { color: Colors.tag.alert.text, fontSize: 13 },
  fieldLabel: { ...Typography.label, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 14, color: Colors.ink, marginBottom: Spacing.md,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { ...Typography.body, fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '600', color: Colors.ink },
});
