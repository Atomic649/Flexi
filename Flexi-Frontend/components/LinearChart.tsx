import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { CustomText } from './CustomText';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface DataPoint {
  date: string;
  income: number;
  expense: number;
  adsCost: number;
  profit: number;
}

interface LinearChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
}

const formatYLabel = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
};

const smoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
};

const areaPath = (points: { x: number; y: number }[], bottomY: number): string => {
  if (points.length === 0) return '';
  return `${smoothPath(points)} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
};

type LineKey = 'income' | 'expense' | 'adsCost' | 'profit';

const LinearChart: React.FC<LinearChartProps> = ({
  data,
  width,
  height = 200,
  showGrid = true,
  showLabels = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleLines, setVisibleLines] = useState<Record<LineKey, boolean>>({
    income: true,
    expense: true,
    adsCost: true,
    profit: true,
  });

  const toggleLine = (key: LineKey) =>
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));

  if (!data || data.length === 0) return null;

  const isDark = theme === 'dark';
  const chartWidth = width || containerWidth || Dimensions.get('window').width - 60;

  const paddingLeft = 52;
  const paddingRight = 12;
  const paddingTop = 16;
  const paddingBottom = 16;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Always use full value range so axes stay stable when toggling
  const allValues = data.flatMap(d => [d.income, d.expense, d.adsCost, d.profit]);
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  const getY = (value: number) =>
    paddingTop + innerHeight - ((value - minValue) / valueRange) * innerHeight;
  const getX = (index: number) =>
    paddingLeft + (index / (data.length - 1 || 1)) * innerWidth;

  const bottomY = getY(minValue);
  const incomePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.income) }));
  const expensePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.expense) }));
  const adsCostPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.adsCost) }));
  const profitPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.profit) }));

  const GRID_LINES = 4;
  const gridColor = isDark ? '#3f3f46' : '#e4e4e7';
  const labelColor = isDark ? '#71717a' : '#a1a1aa';
  const cardBg = isDark ? '#27272a' : '#f4f4f5';

  const incomeColor = '#02c796';
  const expenseColor = '#ff6b6b';
  const adsCostColor = '#f59e0b';
  const profitColor = isDark ? '#00fad9' : '#09ddc1';

  const LINES: { key: LineKey; color: string; label: string; dashed?: boolean }[] = [
    { key: 'income', color: incomeColor, label: t('dashboard.income') },
    { key: 'expense', color: expenseColor, label: t('dashboard.expense'), dashed: true },
    { key: 'adsCost', color: adsCostColor, label: t('dashboard.ads'), dashed: true },
    { key: 'profit', color: profitColor, label: t('dashboard.profit') },
  ];

  const pointsMap: Record<LineKey, { x: number; y: number }[]> = {
    income: incomePoints,
    expense: expensePoints,
    adsCost: adsCostPoints,
    profit: profitPoints,
  };

  return (
    <View
      style={{ width: '100%' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={chartWidth} height={height}>
        <Defs>
          <SvgLinearGradient id="incomeArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={incomeColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={incomeColor} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="expenseArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={expenseColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={expenseColor} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="adsCostArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={adsCostColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={adsCostColor} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="profitArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={profitColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={profitColor} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {showGrid &&
          Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const y = paddingTop + (innerHeight / GRID_LINES) * i;
            return (
              <Line
                key={`grid-${i}`}
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + innerWidth}
                y2={y}
                stroke={gridColor}
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            );
          })}

        {/* Area fills */}
        {visibleLines.income && (
          <Path d={areaPath(incomePoints, bottomY)} fill="url(#incomeArea)" />
        )}
        {visibleLines.profit && (
          <Path d={areaPath(profitPoints, bottomY)} fill="url(#profitArea)" />
        )}
        {visibleLines.expense && (
          <Path d={areaPath(expensePoints, bottomY)} fill="url(#expenseArea)" />
        )}
        {visibleLines.adsCost && (
          <Path d={areaPath(adsCostPoints, bottomY)} fill="url(#adsCostArea)" />
        )}

        {/* Lines */}
        {visibleLines.income && (
          <Path
            d={smoothPath(incomePoints)}
            stroke={incomeColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {visibleLines.expense && (
          <Path
            d={smoothPath(expensePoints)}
            stroke={expenseColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />
        )}
        {visibleLines.adsCost && (
          <Path
            d={smoothPath(adsCostPoints)}
            stroke={adsCostColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />
        )}
        {visibleLines.profit && (
          <Path
            d={smoothPath(profitPoints)}
            stroke={profitColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {data.map((point, index) => {
          const x = getX(index);
          return (
            <React.Fragment key={index}>
              {visibleLines.income && (
                <Circle cx={x} cy={getY(point.income)} r="4" fill={cardBg} stroke={incomeColor} strokeWidth="2" />
              )}
              {visibleLines.expense && (
                <Circle cx={x} cy={getY(point.expense)} r="4" fill={cardBg} stroke={expenseColor} strokeWidth="2" />
              )}
              {visibleLines.adsCost && (
                <Circle cx={x} cy={getY(point.adsCost)} r="4" fill={cardBg} stroke={adsCostColor} strokeWidth="2" />
              )}
              {visibleLines.profit && (
                <Circle cx={x} cy={getY(point.profit)} r="4" fill={cardBg} stroke={profitColor} strokeWidth="2" />
              )}
            </React.Fragment>
          );
        })}

        {/* Y-axis labels */}
        {showLabels &&
          Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const value = maxValue - (i / GRID_LINES) * valueRange;
            const y = paddingTop + (innerHeight / GRID_LINES) * i;
            return (
              <SvgText
                key={`ylabel-${i}`}
                x={paddingLeft - 8}
                y={y + 4}
                fontSize="10"
                fill={labelColor}
                textAnchor="end"
              >
                {formatYLabel(value)}
              </SvgText>
            );
          })}
      </Svg>

      {/* X-axis labels */}
      {showLabels && (
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: paddingLeft,
            paddingRight: paddingRight,
            marginTop: 4,
          }}
        >
          {data.map((point, index) => (
            <CustomText
              key={index}
              style={{
                flex: 1,
                fontSize: 10,
                color: labelColor,
                textAlign: 'center',
              }}
            >
              {format(new Date(point.date), 'dd/MM')}
            </CustomText>
          ))}
        </View>
      )}

      {/* Legend — press to toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8, flexWrap: 'wrap' }}>
        {LINES.map(({ key, color, label, dashed }) => {
          const active = visibleLines[key];
          return (
            <TouchableOpacity
              key={key}
              onPress={() => toggleLine(key)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: active
                  ? isDark
                    ? `${color}22`
                    : `${color}18`
                  : isDark
                  ? '#3f3f4633'
                  : '#e4e4e733',
                borderWidth: 1,
                borderColor: active ? `${color}66` : 'transparent',
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: active ? color : labelColor,
                  opacity: dashed ? 0.8 : 1,
                }}
              />
              <CustomText
                style={{
                  fontSize: 11,
                  color: active ? color : labelColor,
                  opacity: active ? 1 : 0.5,
                }}
                weight={active ? 'bold' : 'regular'}
              >
                {label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default LinearChart;
