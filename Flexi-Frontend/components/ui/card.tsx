import React, { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
  bgColor: string;
}


export function Card({ children, className,bgColor = "" }: CardProps) {
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: bgColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      className={className}
    >
      {children}
    </View>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <View
      style={{
        padding: 24,
      }}
      className={className}
    >
      {children}
    </View>
  );
}