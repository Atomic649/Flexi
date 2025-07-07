import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';

interface CustomTextProps extends TextProps {
  weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  link?: boolean;
}

export function CustomText({ children, weight = 'regular', style, ...props }: CustomTextProps) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const isThaiLanguage = i18n.language === 'th';

  const getFontFamily = () => {
    const prefix = isThaiLanguage ? 'NotoSansThai' : 'Poppins';
    const capitalizedWeight = weight.charAt(0).toUpperCase() + weight.slice(1);
    return `${prefix}-${capitalizedWeight}`;
  };

  // Safe rendering of children - handle objects properly
  const renderChildren = () => {
    if (children === null || children === undefined) {
      return '';
    }
    
    if (typeof children === 'object' && children !== null && !React.isValidElement(children)) {
      // If it's an object with message property, use that
      if ('message' in children && typeof children.message === 'string') {
        return children.message;
      }
      // Otherwise try to stringify it
      try {
        return JSON.stringify(children);
      } catch (e) {
        console.warn('Could not stringify object in CustomText:', e);
        return '[Object]';
      }
    }
    
    return children;
  };

  return (
    <RNText
      style={[
      { 
        fontFamily: getFontFamily(),
        color: props.link ? '#00dec1' : theme === 'dark' ? '#b4b3b3' : '#2a2a2a'
      }, 
      style
      ]}
      {...props}
    >
      {renderChildren()}
    </RNText>
  );
}