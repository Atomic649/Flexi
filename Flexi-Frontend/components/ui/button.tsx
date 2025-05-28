import React, { ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  children: ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onPress?: () => void;
}

export function Button({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  onPress 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "#20B2AA", // turquoise color
        };
      default:
        return {
          backgroundColor: "#20B2AA", // turquoise color
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case "lg":
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
      default:
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 15,
        };
    }
  };

  const textColor = variant === "outline" ? "#20B2AA" : "#ffffff";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        {
          paddingVertical: getSizeStyles().paddingVertical,
          paddingHorizontal: getSizeStyles().paddingHorizontal,
        }
      ]}
      className={className}
      onPress={onPress}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize: getSizeStyles().fontSize }
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: "600",
  }
});