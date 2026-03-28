import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "./CustomText";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface PieSlice {
  group: string;
  amount: number;
  percentage: number;
}

interface PieChartProps {
  data: PieSlice[];
  total: number;
  size?: number;
}

const COLORS = [
  "#00fad9", "#ffb30e", "#FF006E", "#a78bfa", "#34d399",
  "#f97316", "#60a5fa", "#f472b6", "#facc15", "#4ade80",
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function slicePath(cx: number, cy: number, r: number, innerR: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const iStart = polarToCartesian(cx, cy, innerR, endAngle);
  const iEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const PieChart = ({ data, total, size = Math.min(Dimensions.get("window").width * 0.45, 180) }: PieChartProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 900 });
  }, [data]);

  if (!data || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.52;

  let cumulative = 0;
  const slices = data.map((item, i) => {
    const startAngle = cumulative * 3.6;
    cumulative += item.percentage;
    const endAngle = cumulative * 3.6;
    return { ...item, startAngle, endAngle, color: COLORS[i % COLORS.length] };
  });

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        {/* Pie */}
        <Svg width={size} height={size}>
          <G>
            {slices.length === 1 ? (
              // Single item — draw two full-circle rings (SVG can't arc 360° in one path)
              <>
                <Circle cx={cx} cy={cy} r={outerR} fill={slices[0].color} opacity={0.92} />
                <Circle cx={cx} cy={cy} r={innerR} fill={theme === "dark" ? "#27272a" : "#f4f4f5"} />
              </>
            ) : (
              slices.map((slice, i) => {
                const angleDiff = slice.endAngle - slice.startAngle;
                if (angleDiff < 0.3) return null;
                // Near-full slice (≥359°): draw as two half-arcs to avoid degenerate path
                if (angleDiff >= 359) {
                  const midAngle = slice.startAngle + angleDiff / 2;
                  const d1 = slicePath(cx, cy, outerR, innerR, slice.startAngle, midAngle);
                  const d2 = slicePath(cx, cy, outerR, innerR, midAngle, slice.endAngle);
                  return (
                    <G key={i}>
                      <Path d={d1} fill={slice.color} opacity={0.92} />
                      <Path d={d2} fill={slice.color} opacity={0.92} />
                    </G>
                  );
                }
                const d = slicePath(cx, cy, outerR, innerR, slice.startAngle, slice.endAngle);
                return <Path key={i} d={d} fill={slice.color} opacity={0.92} />;
              })
            )}
            {/* Center hole bg */}
            <Circle
              cx={cx}
              cy={cy}
              r={innerR - 2}
              fill={theme === "dark" ? "#27272a" : "#f4f4f5"}
            />
          </G>
        </Svg>

        {/* Legend */}
        <View style={{ flex: 1, paddingLeft: 16 }}>
          {slices.map((slice, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: slice.color,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <View style={{ flex: 1 }}>
                <CustomText
                  weight="semibold"
                  style={{ fontSize: 12, color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
                  numberOfLines={1}
                >
                  {slice.group === "Others" ? t("dashboard.expenseByCustomGroup.others") : slice.group}
                </CustomText>
                <CustomText style={{ fontSize: 11, opacity: 0.6 }}>
                  {`${slice.percentage}% · ${formatAmount(slice.amount)} ฿`}
                </CustomText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Total */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme === "dark" ? "#3f3f42" : "#e5e7eb",
          marginTop: 12,
          paddingTop: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <CustomText style={{ opacity: 0.6, fontSize: 13 }}>{t("dashboard.expenseByCustomGroup.total")}</CustomText>
        <CustomText weight="bold" style={{ fontSize: 13 }}>
          {`${formatAmount(total)} ฿`}
        </CustomText>
      </View>
    </View>
  );
};

export default PieChart;
