import React from "react";
import { View, Text } from "react-native";
import { getDeviceType, isMobile } from "../utils/responsive";
import { useTheme } from "../providers/ThemeProvider";

interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
  cumulativeTax: number;
}

interface TaxBracketStairs3DProps {
  taxBrackets: TaxBracket[];
  taxableIncome: number;
}

const steps = 7;
const baseHeight = 30; // px
const heightStep = 14; // px
const blockWidth = 44; // px
const blockGap = 8; // px

export default function TaxBracketStairs3D({
  taxBrackets,
  taxableIncome,
}: TaxBracketStairs3DProps) {
  // Responsive sizing using getDeviceType from responsive.ts
  const deviceType = getDeviceType();
  let dynamicBlockWidth = blockWidth;
  let dynamicBaseHeight = baseHeight;
  let dynamicHeightStep = heightStep;
  let dynamicBlockGap = blockGap;
  let labelFontSize = 16;

  if (deviceType === "mobile") {
    dynamicBlockWidth = 35;
    dynamicBaseHeight = 10;
    dynamicHeightStep = 6;
    dynamicBlockGap = 4;
    labelFontSize = 10;
  } else if (deviceType === "tablet") {
    dynamicBlockWidth = 32;
    dynamicBaseHeight = 24;
    dynamicHeightStep = 10;
    dynamicBlockGap = 6;
    labelFontSize = 13;
  }

  // Find the bracket index for highlight
  let highlightIdx = taxBrackets.findIndex(
    (b) =>
      taxableIncome > b.min && (b.max === undefined || taxableIncome <= b.max)
  );
  if (highlightIdx === -1) {
    highlightIdx = 0; // Always highlight the first block if no bracket matches (e.g., income <= 0)
  }

  // Get theme from ThemeProvider
  const { theme } = useTheme();

  return (
    <View
      className="flex-col items-center justify-center"
      style={{
        height: dynamicBaseHeight + dynamicHeightStep * steps,    
        marginBottom: 20,
      }}
    >
      <View className="flex-row items-end justify-center">
        {Array.from({ length: steps }).map((_, i) => {
          const isHighlight = i === highlightIdx;
          const height = dynamicBaseHeight + i * dynamicHeightStep;
      
          return (
            <View
              key={i}
              className={`mx-1 rounded-md shadow-lg`}
              style={{
                width: dynamicBlockWidth,
                height,
                marginHorizontal: isMobile() ? "100%" : dynamicBlockGap / 2,
                position: "relative",
                alignItems: "center",
                justifyContent: "flex-end",
                shadowColor: "#000",
                shadowOffset: { width: 0.2, height: 0.5 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation:1,
                backgroundColor: isHighlight
                  ? theme === "dark"
                    ? "#53fadb"
                    : "#53fadb"
                  : theme === "dark"
                  ? "#333333"
                  : "#ffffff",
              }}
            />
          );
        })}
      </View>
      {/* Percent label below the graph */}
      <View className="flex-row justify-center mt-2">
        {Array.from({ length: steps }).map((_, i) => {
          const isHighlight = i === highlightIdx;
          // Use rate as percent label if available, else fallback to calculated percent
          let percent = "";
          if (taxBrackets[i] && typeof taxBrackets[i].rate === "number") {
            percent = `${Math.round(taxBrackets[i].rate * 100)}%`;
          } else {
            percent = Math.round((i / (steps - 1)) * 100) + "%";
          }
          return (
            <Text
              key={i}
              className={`mx-1 font-bold ${isHighlight ? "" : "text-gray-400"}`}
              style={{
                width: dynamicBlockWidth,
                textAlign: "center",
                fontSize: labelFontSize ,
                fontWeight: "800",
                color: isHighlight ? "#00e6cf" : "transparent",
              }}
            >
              {percent}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
