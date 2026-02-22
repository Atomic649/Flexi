import { View } from '@/components/Themed';
import { CustomText } from '@/components/CustomText';
import { useBackgroundColorClass, useTextColorClass } from '@/utils/themeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallAPIBusiness from '@/api/business_api';
import CustomAlert from '@/components/CustomAlert';

const ROLES = ['owner', 'marketing', 'accountant', 'sales', 'partner'] as const;
type MemberRole = typeof ROLES[number];

export default function PartnerOnboarding() {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('partner');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ visible: false, title: '', message: '', buttons: [] });

  const getErrorMessage = (error: any): string => {
    const msg: string = error?.message || '';
    if (msg.includes('already connected')) return t('partner.alreadyConnected');
    if (msg.includes('Business account not found') || msg.includes('Please check the business')) return t('partner.businessNotFound');
    if (msg === 'Member not found') return t('partner.memberNotFound');
    return msg || t('partner.connectionError');
  };

  const showAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons ?? [{ text: t('common.ok', 'OK'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }],
    });
  };

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
      showAlert(t('partner.error', 'Error'), t('partner.businessIdRequired', 'Please enter a Business ID'));
      return;
    }

    if (!memberId) {
      showAlert(t('partner.error', 'Error'), t('partner.memberIdMissing', 'Member ID not found'));
      return;
    }

    setLoading(true);
    try {
      await CallAPIBusiness.ConnectPartnerAPI(businessId, memberId, selectedRole);

      showAlert(
        t('partner.success', 'Success'),
        t('partner.connectedSuccessfully', 'Successfully connected as partner!'),
        [
          {
            text: t('partner.ok', 'OK'),
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              setIsModalVisible(false);
              setBusinessId('');
              setSelectedRole('partner');
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to connect partner:', error);
      setIsModalVisible(false);
      showAlert(t('partner.error', 'Error'), getErrorMessage(error));
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
          style={{ backgroundColor: '#b3b3b3', paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
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
          onPress={() => router.back()}
          style={{ backgroundColor: '#2D2D2D', paddingVertical: 14, borderRadius: 12 }}
        >
          <CustomText style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
            {t('partner.backHome', 'Back to Home')}
          </CustomText>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for entering Business ID and selecting role */}
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

            {/* Role selector */}
            <CustomText style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>
              {t('team.selectRole', 'Select Role')}
            </CustomText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, backgroundColor: 'transparent' }}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  disabled={loading}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: selectedRole === role ? '#04ecc1' : '#555',
                    backgroundColor: selectedRole === role ? 'rgba(4,236,193,0.15)' : 'transparent',
                  }}
                >
                  <CustomText style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: selectedRole === role ? '#04ecc1' : '#aaa',
                  }}>
                    {t(`team.roles.${role}`)}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setBusinessId('');
                  setSelectedRole('partner');
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
