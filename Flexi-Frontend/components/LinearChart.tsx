import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { CustomText } from './CustomText';
import { format } from 'date-fns';

interface DataPoint {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

interface LinearChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
}

const LinearChart: React.FC<LinearChartProps> = ({
  data,
  width = Dimensions.get('window').width - 60,
  height = 200,
  showGrid = true,
  showLabels = true,
}) => {
  const { theme } = useTheme();
  
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate dimensions
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Find min and max values
  const allValues = data.flatMap(d => [d.income, d.expense, d.profit]);
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  // Calculate positions
  const stepX = chartWidth / (data.length - 1 || 1);
  
  const getY = (value: number) => {
    return padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  const getX = (index: number) => {
    return padding + (index * stepX);
  };

  // Generate path for income line
  const incomePathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.income);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate path for expense line
  const expensePathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.expense);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate path for profit line
  const profitPathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.profit);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      gridLines.push(
        <Line
          key={`h-grid-${i}`}
          x1={padding}
          y1={y}
          x2={padding + chartWidth}
          y2={y}
          stroke={theme === 'dark' ? '#3f3f42' : '#e5e7eb'}
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }

    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = getX(i);
      gridLines.push(
        <Line
          key={`v-grid-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={padding + chartHeight}
          stroke={theme === 'dark' ? '#3f3f42' : '#e5e7eb'}
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }
  }

  return (
    <View style={{ width, height: height + 40 }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#02c796" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#02c796" stopOpacity="0.1" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid */}
        {gridLines}

        {/* Lines */}
        <Path
          d={incomePathData}
          stroke="#02c796"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <Path
          d={expensePathData}
          stroke="#ff6b6b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Path
          d={profitPathData}
          stroke={theme === 'dark' ? '#00fad9' : '#09ddc1'}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = getX(index);
          return (
            <React.Fragment key={index}>
              <Circle
                cx={x}
                cy={getY(point.income)}
                r="4"
                fill="#02c796"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <Circle
                cx={x}
                cy={getY(point.expense)}
                r="4"
                fill="#ff6b6b"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <Circle
                cx={x}
                cy={getY(point.profit)}
                r="4"
                fill={theme === 'dark' ? '#00fad9' : '#09ddc1'}
                stroke="#ffffff"
                strokeWidth="2"
              />
            </React.Fragment>
          );
        })}

        {/* Y-axis labels */}
        {showLabels && (
          <>
            <SvgText
              x={padding - 10}
              y={padding + 5}
              fontSize="10"
              fill={theme === 'dark' ? '#c9c9c9' : '#666'}
              textAnchor="end"
            >
              {maxValue.toLocaleString()}
            </SvgText>
            <SvgText
              x={padding - 10}
              y={padding + chartHeight / 2}
              fontSize="10"
              fill={theme === 'dark' ? '#c9c9c9' : '#666'}
              textAnchor="end"
            >
              {((maxValue + minValue) / 2).toLocaleString()}
            </SvgText>
            <SvgText
              x={padding - 10}
              y={padding + chartHeight + 5}
              fontSize="10"
              fill={theme === 'dark' ? '#c9c9c9' : '#666'}
              textAnchor="end"
            >
              {minValue.toLocaleString()}
            </SvgText>
          </>
        )}
      </Svg>

      {/* X-axis labels */}
      {showLabels && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: padding,
          marginTop: 10 
        }}>
          {data.map((point, index) => (
            <CustomText
              key={index}
              style={{
                fontSize: 10,
                color: theme === 'dark' ? '#c9c9c9' : '#666',
                textAlign: 'center',
                flex: 1,
              }}
            >
              {format(new Date(point.date), 'dd/MM')}
            </CustomText>
          ))}
        </View>
      )}

      {/* Legend */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 15,
        gap: 20 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 12, 
            height: 3, 
            backgroundColor: '#02c796', 
            marginRight: 6,
            borderRadius: 2 
          }} />
          <CustomText style={{ 
            fontSize: 12, 
            color: theme === 'dark' ? '#c9c9c9' : '#666' 
          }}>
            Income
          </CustomText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 12, 
            height: 3, 
            backgroundColor: '#ff6b6b', 
            marginRight: 6,
            borderRadius: 2 
          }} />
          <CustomText style={{ 
            fontSize: 12, 
            color: theme === 'dark' ? '#c9c9c9' : '#666' 
          }}>
            Expense
          </CustomText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 12, 
            height: 3, 
            backgroundColor: theme === 'dark' ? '#00fad9' : '#09ddc1', 
            marginRight: 6,
            borderRadius: 2 
          }} />
          <CustomText style={{ 
            fontSize: 12, 
            color: theme === 'dark' ? '#c9c9c9' : '#666' 
          }}>
            Profit
          </CustomText>
        </View>
      </View>
    </View>
  );
};

export default LinearChart;