import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { useTheme } from "@/providers/ThemeProvider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const CircularChart = ({ 
  percentage, 
  size = 136,
  strokeWidth = 28
}: CircularChartProps) => {
  const { theme } = useTheme();
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const strokeDashoffset = useSharedValue(circumference);

  const strokeColor = theme === "dark" ? "#f2aa10" : "#ffb30e";
  const bgStrokeColor = theme === "dark" ? "#00fad9" : "#18ffe4";

  useEffect(() => {
    strokeDashoffset.value = withTiming(circumference - (percentage / 100) * circumference, {
      duration: 1000, // Animation duration in milliseconds
    });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <View className="items-center justify-center w-36 h-36">
      <Svg height={size} width={size}>
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={bgStrokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
        <SvgText
          x={radius}
          y={radius}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="20"
          fill={strokeColor}
          fontWeight="bold"
        >
          {`${percentage}%`}
        </SvgText>
      </Svg>
    </View>
  );
};

export default CircularChart;