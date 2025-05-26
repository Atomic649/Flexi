import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
  className?: string;
}

export function LineChart({ color = "currentColor", size = 24, className = "" }: IconProps) {
  return (
    <View className={className}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 3v18h18" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M21 12l-6-6-4 8-3-3-5 5" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function CheckCircle({ color = "currentColor", size = 24, className = "" }: IconProps) {
  return (
    <View className={className}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M22 11.08V12a10 10 0 1 1-5.93-9.14" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M22 4L12 14.01l-3-3" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ShieldCheck({ color = "currentColor", size = 24, className = "" }: IconProps) {
  return (
    <View className={className}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M9 12l2 2 4-4" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function Globe({ color = "currentColor", size = 24, className = "" }: IconProps) {
  return (
    <View className={className}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M2 12h20" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}