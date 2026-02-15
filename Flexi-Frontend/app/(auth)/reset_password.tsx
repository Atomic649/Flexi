import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CallAPIUser from '@/api/auth_api';
import { useTranslation } from 'react-i18next';


export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { t } = useTranslation();

  const rawToken = Array.isArray(token) ? token[0] : token;
  // Some email clients can wrap long URLs and introduce whitespace/newlines.
  const normalizedToken = typeof rawToken === 'string' ? rawToken.replace(/\s+/g, '') : rawToken;
  
  console.log("ResetPassword Screen - Token:", normalizedToken);

  const getErrorMessage = (err: unknown) => {
    if (!err) return t("common.networkError");
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    if (typeof err === "object") {
      const anyErr = err as any;
      if (typeof anyErr.message === "string") return anyErr.message;
      if (anyErr.error && typeof anyErr.error.message === "string") return anyErr.error.message;
    }
    return t("common.networkError");
  };

  // Must match backend password policy (authController passwordSchema)
  const isStrongPassword = (value: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).+$/.test(value);

  useEffect(() => {
    if (!normalizedToken) {
      Alert.alert(
        t('resetPassword.invalidLink'),
        t('resetPassword.invalidLinkMessage'),
        [{ text: t('common.ok'), onPress: () => router.push('/forgot_password') }]
      );
    }
  }, [normalizedToken, t, router]);

  const handleResetPassword = async () => {
    console.log("handleResetPassword called");

    // Validate inputs
    if (!normalizedToken) {
      console.log("Validation failed: No token");
      Alert.alert(t('resetPassword.error'), t('resetPassword.invalidLink'));
      return;
    }

    if (!newPassword.trim()) {
      console.log("Validation failed: Empty password");
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log("Validation failed: Mismatch");
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 8 || !isStrongPassword(newPassword)) {
      console.log("Validation failed: Weak password");
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordLength'));
      return;
    }

    try {
      console.log("Calling resetPasswordAPI...");
      setIsLoading(true);
      await CallAPIUser.resetPasswordAPI({ 
        token: (normalizedToken as string), 
        newPassword 
      });
      console.log("API call successful");
      
      setIsLoading(false);
      
      // Show success message and navigate to login
      if (Platform.OS === 'web') {
        alert(t('resetPassword.successMessage'));
        router.replace('/login');
      } else {
        Alert.alert(
          t('resetPassword.success'), 
          t('resetPassword.successMessage'), 
          [{ text: t('resetPassword.login'), onPress: () => router.replace('/login') }]
        );
      }
    } catch (error) {
      console.log("API call failed:", error);
      setIsLoading(false);
      Alert.alert(
        t('resetPassword.error'), 
        getErrorMessage(error) || t('resetPassword.invalidLinkMessage')
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            {t('resetPassword.subtitle')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('resetPassword.newPasswordLabel')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('resetPassword.confirmPasswordLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              isLoading && styles.buttonDisabled
            ]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('resetPassword.resetButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.linkText}>{t('resetPassword.backToLogin')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',  
    maxWidth: 800,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: '#5e5d59',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
    padding: 8,
  },
  linkText: {
    color: '#5e5d59',
    fontSize: 16,
  },
});