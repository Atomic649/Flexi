import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native-gesture-handler';
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

  useEffect(() => {
    if (!token) {
      Alert.alert(
        t('resetPassword.invalidLink'),
        t('resetPassword.invalidLinkMessage'),
        [{ text: 'OK', onPress: () => router.push('/forgot_password') }]
      );
    }
  }, [token, t, router]);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword.trim()) {
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('resetPassword.error'), t('resetPassword.passwordLength'));
      return;
    }

    try {
      setIsLoading(true);
      await CallAPIUser.resetPasswordAPI({ 
        token: token as string, 
        newPassword 
      });
      
      setIsLoading(false);
      
      // Show success message and navigate to login
      Alert.alert(
        t('resetPassword.success'), 
        t('resetPassword.successMessage'), 
        [{ text: t('resetPassword.login'), onPress: () => router.push('/login') }]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        t('resetPassword.error'), 
        error instanceof Error ? error.message : 'Failed to reset password. The link may have expired.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
    

      <View style={styles.content}>
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
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.button, 
            (!newPassword.trim() || !confirmPassword.trim()) && styles.buttonDisabled
          ]} 
          onPress={handleResetPassword}
          disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#5e5d59',
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