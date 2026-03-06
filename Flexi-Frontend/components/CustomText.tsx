import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface CustomTextProps extends TextProps {
  weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  link?: boolean;
}

// Split text into Thai and non-Thai segments so each gets the correct font.
// Non-Thai (A-Z, numbers, symbols) always uses Poppins; Thai uses IBMPlexSansThai.
function splitByScript(text: string): { text: string; isThai: boolean }[] {
  const segments: { text: string; isThai: boolean }[] = [];
  const regex = /([\u0E00-\u0E7F]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isThai: false });
    }
    segments.push({ text: match[0], isThai: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isThai: false });
  }
  return segments;
}

export function CustomText({ children, weight = 'medium', style, ...props }: CustomTextProps) {
  const { theme } = useTheme();
  const capitalizedWeight = weight.charAt(0).toUpperCase() + weight.slice(1);
  const poppinsFont = `Poppins-${capitalizedWeight}`;
  const thaiFont = `IBMPlexSansThai-${capitalizedWeight}`;

  const renderString = (text: string) => {
    const segments = splitByScript(text);
    if (segments.length === 1 && !segments[0].isThai) return text;
    return segments.map((seg, i) =>
      seg.isThai
        ? <RNText key={i} style={{ fontFamily: thaiFont }}>{seg.text}</RNText>
        : seg.text
    );
  };

  const renderChildren = (): React.ReactNode => {
    if (children === null || children === undefined) return '';
    if (typeof children === 'string') return renderString(children);
    if (typeof children === 'number') return String(children);
    if (Array.isArray(children)) {
      return children.map((child, i) =>
        typeof child === 'string' ? <React.Fragment key={i}>{renderString(child)}</React.Fragment> : child
      );
    }
    if (typeof children === 'object' && !React.isValidElement(children)) {
      if ('message' in children && typeof (children as any).message === 'string') {
        return renderString((children as any).message);
      }
      try { return JSON.stringify(children); } catch (e) { return '[Object]'; }
    }
    return children;
  };

  return (
    <RNText
      style={[
        {
          fontFamily: poppinsFont,
          color: props.link ? '#00dec1' : theme === 'dark' ? '#b4b3b3' : '#2a2a2a',
         
        },
        style,
      ]}
      {...props}
    >
      {renderChildren()}
    </RNText>
  );
}