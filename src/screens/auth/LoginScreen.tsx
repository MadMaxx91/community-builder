import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView, Image,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Font } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TranslationKey } from '../../i18n/translations';

type Props = { navigation: any };

export function LoginScreen({ navigation }: Props) {
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErrorKey(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
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

          <View style={styles.logoArea}>
            <Image
              source={require('../../../assets/torbu-mark.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Torbu</Text>
            <Text style={styles.tagline}>Share nearby. Belong locally.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t('auth.welcomeBack')}</Text>

            {errorKey && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{t(errorKey)}</Text>
              </View>
            )}

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
              placeholder="••••••••"
              placeholderTextColor={Colors.inkMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={{ height: Spacing.sm }} />

            {loading
              ? <ActivityIndicator color={Colors.ink} />
              : <Button label={t('auth.logIn')} onPress={handleLogin} fullWidth />
            }

            <View style={styles.hint}>
              <Text style={styles.hintText}>{t('auth.hint')}</Text>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={loginWithGoogle} activeOpacity={0.75}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialBtnText}>{t('auth.continueWithGoogle')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, styles.appleBtn]} onPress={loginWithApple} activeOpacity={0.75}>
              <Text style={[styles.socialIcon, styles.appleSocialIcon]}></Text>
              <Text style={[styles.socialBtnText, styles.appleBtnText]}>{t('auth.continueWithApple')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchText}>{t('auth.noAccount')} </Text>
            <Text style={styles.switchLink}>{t('auth.signUp')}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, padding: Spacing.md, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoImage: { width: 100, height: 125 },
  appName: {
    fontFamily: Font.heading,
    fontSize: 34,
    color: Colors.ink,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: Font.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Font.headingSemi,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    backgroundColor: Colors.tag.alert.bg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { fontFamily: Font.body, color: Colors.tag.alert.text, fontSize: 13 },
  fieldLabel: { fontFamily: Font.bodyMedium, fontSize: 13, color: Colors.ink, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Font.body,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  hint: { marginTop: Spacing.md, alignItems: 'center' },
  hintText: { fontFamily: Font.body, fontSize: 12, color: Colors.inkMuted, fontStyle: 'italic' },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { fontFamily: Font.body, fontSize: 14, color: Colors.inkSoft },
  switchLink: { fontFamily: Font.bodySemi, fontSize: 14, color: Colors.ink },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { fontFamily: Font.body, color: Colors.inkMuted, fontSize: 12 },
  socialRow: { gap: Spacing.sm, marginBottom: Spacing.lg },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 13,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  appleBtn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  socialIcon: {
    width: 20, height: 20,
    fontFamily: Font.heading,
    fontSize: 14,
    color: '#4285F4',
    textAlign: 'center',
    lineHeight: 20,
    borderRadius: 10,
  },
  appleSocialIcon: { color: Colors.accentFg },
  socialBtnText: { fontFamily: Font.bodySemi, fontSize: 14, color: Colors.ink },
  appleBtnText: { color: Colors.accentFg },
});
