import { View } from '@/components/Themed';
import { CustomText } from '@/components/CustomText';
import { useBackgroundColorClass, useTextColorClass } from '@/utils/themeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { CustomButton } from '@/components/CustomButton';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallAPIBusiness from '@/api/business_api';

export default function PartnerOnboarding() {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Load userId and memberId from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedMemberId = await AsyncStorage.getItem('memberId');
        if (storedUserId) setUserId(Number(storedUserId));
        if (storedMemberId) setMemberId(storedMemberId);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleConnectPartner = async () => {
    if (!businessId.trim()) {
      Alert.alert(t('partner.error', 'Error'), t('partner.businessIdRequired', 'Please enter a Business ID'));
      return;
    }

    if (!memberId) {
      Alert.alert(t('partner.error', 'Error'), t('partner.memberIdMissing', 'Member ID not found'));
      return;
    }

    setLoading(true);
    try {
      const response = await CallAPIBusiness.ConnectPartnerAPI(businessId, memberId);

      Alert.alert(
        t('partner.success', 'Success'),
        t('partner.connectedSuccessfully', 'Successfully connected as partner!'),
        [
          {
            text: t('partner.ok', 'OK'),
            onPress: () => {
              setIsModalVisible(false);
              setBusinessId('');
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to connect partner:', error);
      Alert.alert(
        t('partner.error', 'Error'),
        error?.message || t('partner.connectionError', 'An error occurred while connecting. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${useBackgroundColorClass()}`}>      
      <ScrollView contentContainerStyle={{ padding: 20, marginTop: 40 }}>
        <View className='mb-6'>
          <CustomText className={`text-2xl font-semibold pt-2 ${useTextColorClass()}`}> 
            {t('partner.title', 'Partner Onboarding')} 
          </CustomText>
          <CustomText className={`mt-4 text-base ${useTextColorClass()}`}> 
            {t('partner.description', 'You have logged in without a business account. Choose to join as a partner, or go back and register your own business.')} 
          </CustomText>
        </View>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{ backgroundColor: '#04ecc1', paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
        >
          <CustomText style={{ color: '#0d0d0d', fontWeight: '700', textAlign: 'center' }}>
            {t('partner.joinPartner', 'Join as Partner')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/business_register')}
          style={{ backgroundColor: '#04ecc1', paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
        >
          <CustomText style={{ color: '#0d0d0d', fontWeight: '700', textAlign: 'center' }}>
            {t('partner.registerBusiness', 'Register Your Business')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          style={{ backgroundColor: '#2D2D2D', paddingVertical: 14, borderRadius: 12 }}
        >
          <CustomText style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
            {t('partner.backHome', 'Back to Home')}
          </CustomText>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for entering Business ID */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: '#1E1E1E',
              borderRadius: 16,
              padding: 24,
              width: '80%',
              maxWidth: 400,
            }}
          >
            <CustomText style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
              {t('partner.enterBusinessId', 'Enter Business ID')}
            </CustomText>
            <CustomText style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
              {t('partner.businessIdDescription', 'Enter the business username, name, or ID')}
            </CustomText>

            <TextInput
              style={{
                backgroundColor: '#2D2D2D',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: '#fff',
                borderWidth: 1,
                borderColor: '#04ecc1',
                marginBottom: 16,
                fontSize: 14,
              }}
              placeholder={t('partner.businessIdPlaceholder', '@flexi')}
              placeholderTextColor="#666"
              value={businessId}
              onChangeText={setBusinessId}
              editable={!loading}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setBusinessId('');
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#2D2D2D',
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <CustomText style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
                  {t('partner.cancel', 'Cancel')}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConnectPartner}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#04ecc1',
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: loading ? 0.6 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#0d0d0d" />
                ) : (
                  <CustomText style={{ color: '#0d0d0d', fontWeight: '700', textAlign: 'center' }}>
                    {t('partner.connect', 'Connect')}
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
