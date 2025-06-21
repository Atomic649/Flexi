import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CallAPIUser from '@/api/auth_api';
import { useTranslation } from 'react-i18next';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();


  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('forgotPassword.enterEmail'));
      return;
    }

    try {
      setIsLoading(true);
      const response = await CallAPIUser.forgotPasswordAPI({ email: email.trim() });
      
      setIsLoading(false);
      setEmailSent(true);

      // Show success message
      Alert.alert(
        t('forgotPassword.emailSent'), 
        t('forgotPassword.emailSentMessage'),
        [{ text: t('forgotPassword.ok'), onPress: () => router.push('/login') }]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Failed to process request');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
       
        <Text style={styles.headerTitle}>{t('forgotPassword.title')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t('forgotPassword.subtitle')}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('forgotPassword.emailLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('forgotPassword.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, !email.trim() && styles.buttonDisabled]} 
          onPress={handleForgotPassword}
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("forgotPassword.sendButton")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => router.push('/login')}
        >
          <Text style={styles.linkText}>{t('forgotPassword.backToLogin')}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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