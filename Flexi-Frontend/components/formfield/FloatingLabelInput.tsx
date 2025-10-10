import React, { useState } from "react";
import { TextInput, View, TextInputProps } from "react-native";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import i18n from "@/i18n";

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: object;
  inputStyle?: object;
  labelStyle?: object;
  required?: boolean; // Add required prop
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false, // Default to false
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Determine if field should have error styling (required but empty)
  const hasError = required && !value.trim();

  return (
    <View style={[{ position: "relative", marginVertical: 8 }, containerStyle]}>
      {value.length > 0 && (
        <CustomText
          style={[
            {
              position: "absolute",
              left: 16,
              top: -10,
              backgroundColor: theme === "dark" ? "#181818" : "#fff",
              fontSize: 12,
              color: theme === "dark" ? "#504f4d" : "#c0beb5",
              zIndex: 1,
              paddingHorizontal: 4,
            },
            labelStyle,
          ]}
        >
          {label}
        </CustomText>
      )}
      <TextInput
        className={`h-14 px-4 rounded-2xl border-2  ${
          theme === "dark"
            ? "bg-transparent"
            : "bg-white"
        }`}
        style={[
          {
            fontFamily:
              i18n.language === "th"
                ? "IBMPlexSansThai-Medium"
                : "Poppins-Regular",
            color: theme === "dark" ? "#ffffff" : "#000000",
            borderColor: hasError 
              ? "#FF9C01" // border for required but empty fields
              : isFocused 
              ? "#FF9C01" 
              : theme === "dark" ? "#2c2c2cff" : "#c0beb550",           
            cursorColor: "#FF9C01",
          },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={label}
        placeholderTextColor={theme === "dark" ? "#504f4d" : "#c0beb5"}
        {...textInputProps}
      />
    </View>
  );
};
