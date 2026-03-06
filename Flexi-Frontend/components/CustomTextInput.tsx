import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
}

const THAI_REGEX = /[\u0E00-\u0E7F]/;

// Drop-in replacement for TextInput.
// Detects Thai characters in the value and switches to IBMPlexSansThai;
// otherwise always uses Poppins — regardless of app language setting.
export function CustomTextInput({ value, weight = 'medium', style, placeholder, ...props }: CustomTextInputProps) {
  const capitalizedWeight = weight.charAt(0).toUpperCase() + weight.slice(1);
  const hasThai = THAI_REGEX.test(String(value ?? '')) || THAI_REGEX.test(String(placeholder ?? ''));
  const fontFamily = hasThai
    ? `IBMPlexSansThai-${capitalizedWeight}`
    : `Poppins-${capitalizedWeight}`;

  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      style={[style, { fontFamily }]}
      {...props}
    />
  );
}
