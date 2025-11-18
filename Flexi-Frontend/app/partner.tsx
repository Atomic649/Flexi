import { View } from '@/components/Themed';
import { CustomText } from '@/components/CustomText';
import { useBackgroundColorClass, useTextColorClass } from '@/utils/themeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function PartnerOnboarding() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className={`flex-1 ${useBackgroundColorClass()}`}>      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className='mb-6'>
          <CustomText className={`text-2xl font-semibold ${useTextColorClass()}`}> 
            {t('partner.title', 'Partner Onboarding')} 
          </CustomText>
          <CustomText className={`mt-4 text-base ${useTextColorClass()}`}> 
            {t('partner.description', 'You have logged in without a business account. Choose to join as a partner, or go back and register your own business.')} 
          </CustomText>
        </View>
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
    </SafeAreaView>
  );
}
