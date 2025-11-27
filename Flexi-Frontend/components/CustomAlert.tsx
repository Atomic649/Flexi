import React from 'react';
import { Modal, View, TouchableOpacity, Pressable, Platform } from 'react-native';
import { CustomText } from './CustomText';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import AntDesign from '@expo/vector-icons/AntDesign';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  iconName?: keyof typeof AntDesign.glyphMap;
  iconColor?: string;
  iconSize?: number;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
  titleIconName?: keyof typeof AntDesign.glyphMap;
  titleIconColor?: string;
  titleIconSize?: number;
}

const CustomAlert = ({
  visible,
  title,
  message,
  buttons,
  onClose,
  }: CustomAlertProps) => {
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


  const getButtonFontFamily = (style?: string) => {
    const isCancel = style === 'cancel';
    if (i18n.language === 'th') {
      return isCancel ? 'IBMPlexSansThai-Regular' : 'IBMPlexSansThai-Medium';
    }
    return isCancel ? 'Poppins-Regular' : 'Poppins-Medium';
  };

  const renderButtonContent = (button: AlertButton) => (
    <View className="flex-row items-center justify-center">
      {button.iconName && (
        <AntDesign
          name={button.iconName}
          size={button.iconSize ?? 25}
          color={button.iconColor || (button.style)}
          style={{ marginRight: 10 }}
        />
      )}
      <CustomText
        weight={button.style === 'cancel' ? 'regular' : 'medium'}
        className={`text-center ${getButtonStyle(button.style)}`}
        style={{ fontFamily: getButtonFontFamily(button.style) }}
      >
        {button.text}
      </CustomText>
    </View>
  );

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
              className="text-lg text-center pt-1"
              style={{ 
                fontFamily: i18n.language === 'th' ? 'IBMPlexSansThai-Medium' : 'Poppins-Medium'
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
                fontFamily: i18n.language === 'th' ? 'IBMPlexSansThai-Regular' : 'Poppins-Regular'
              }}
            >
              {message}
            </CustomText>
          </View>

          {/* Buttons */}
          <View className={`border-t ${
            theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
          }`}>
            {buttons.map((button, index) => {
              const isLastButton = index === buttons.length - 1;
              const isOnlyButton = buttons.length === 1;
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <View className={
                      theme === 'dark' ? 'border-t border-zinc-700' : 'border-t border-zinc-200'
                    } />
                  )}
                  {Platform.OS === 'android' ? (
                    <Pressable
                      onPress={button.onPress}
                      className={`p-4 ${
                        isLastButton || isOnlyButton ? 'rounded-b-2xl overflow-hidden' : ''
                      }`}
                      android_ripple={{ 
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {renderButtonContent(button)}
                    </Pressable>
                  ) : (
                    <TouchableOpacity
                      onPress={button.onPress}
                      className={`p-4 ${
                      theme === 'dark' ? 'active:bg-zinc-700' : 'active:bg-zinc-300'
                      } ${isLastButton || isOnlyButton ? 'rounded-b-2xl' : ''}`}
                      activeOpacity={0.7}
                    >
                      {renderButtonContent(button)}
                    </TouchableOpacity>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CustomAlert; 