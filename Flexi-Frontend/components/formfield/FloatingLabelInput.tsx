import React, { useState } from "react";
import { View, TextInputProps } from "react-native";
import { CustomText } from "@/components/CustomText";
import { CustomTextInput } from "@/components/CustomTextInput";
import { useTheme } from "@/providers/ThemeProvider";

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
      <CustomTextInput
        className={`h-14 px-4 rounded-xl border-2  ${
          theme === "dark"
            ? "bg-transparent"
            : "bg-white"
        }`}
        style={[
          {
            borderColor: hasError
              ? "#FF9C01"
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
