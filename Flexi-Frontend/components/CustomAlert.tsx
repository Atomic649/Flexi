import React from 'react';
import { Modal, View, TouchableOpacity, Pressable, Platform } from 'react-native';
import { CustomText } from './CustomText';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

const CustomAlert = ({ visible, title, message, buttons, onClose }: CustomAlertProps) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return theme === 'dark' ? 'text-red-400' : 'text-red-500';
      case 'cancel':
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
      default:
        return theme === 'dark' ? 'text-blue-400' : 'text-blue-500';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <View 
          className={`w-[300px] rounded-2xl ${
            theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
          }`}
        >
          {/* Title */}
          <View className="px-4 pt-4 pb-2">
            <CustomText 
              weight="medium"
              className="text-lg text-center"
              style={{ 
                fontFamily: i18n.language === 'th' ? 'NotoSansThai-Medium' : 'Poppins-Medium'
              }}
            >
              {title}
            </CustomText>
          </View>

          {/* Message */}
          <View className="px-4 pb-4">
            <CustomText 
              weight="regular"
              className={`text-center ${
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
              }`}
              style={{ 
                fontFamily: i18n.language === 'th' ? 'NotoSansThai-Regular' : 'Poppins-Regular'
              }}
            >
              {message}
            </CustomText>
          </View>

          {/* Buttons */}
          <View className={`border-t ${
            theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
          }`}>
            {buttons.map((button, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <View className={
                    theme === 'dark' ? 'border-t border-zinc-700' : 'border-t border-zinc-200'
                  } />
                )}
                {Platform.OS === 'android' ? (
                  <Pressable
                    onPress={button.onPress}
                    className="p-4"
                    android_ripple={{ 
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <CustomText 
                      weight={button.style === 'cancel' ? 'regular' : 'medium'}
                      className={`text-center ${getButtonStyle(button.style)}`}
                      style={{ 
                        fontFamily: i18n.language === 'th' 
                          ? button.style === 'cancel' ? 'NotoSansThai-Regular' : 'NotoSansThai-Medium'
                          : button.style === 'cancel' ? 'Poppins-Regular' : 'Poppins-Medium'
                      }}
                    >
                      {button.text}
                    </CustomText>
                  </Pressable>
                ) : (
                  <TouchableOpacity
                    onPress={button.onPress}
                    className="p-4 active:bg-zinc-600 dark:active:bg-zinc-700"
                    activeOpacity={0.7}
                  >
                    <CustomText 
                      weight={button.style === 'cancel' ? 'regular' : 'medium'}
                      className={`text-center ${getButtonStyle(button.style)}`}
                      style={{ 
                        fontFamily: i18n.language === 'th' 
                          ? button.style === 'cancel' ? 'NotoSansThai-Regular' : 'NotoSansThai-Medium'
                          : button.style === 'cancel' ? 'Poppins-Regular' : 'Poppins-Medium'
                      }}
                    >
                      {button.text}
                    </CustomText>
                  </TouchableOpacity>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CustomAlert; 