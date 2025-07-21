import { Text as DefaultText, View as DefaultView } from 'react-native'
import Colors from '@/constants/Colors'
import { useTheme } from '@/providers/ThemeProvider'

type ThemeProps = {
    lightColor?: string;
    darkColor?: string;
}

export type TextProps = ThemeProps & DefaultText['props'] & {
    fontWeight?: 'thin' | 'extraLight' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold' | 'black';
}

export type ViewProps = ThemeProps & DefaultView['props']

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const { theme } = useTheme();
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[theme][colorName];
    }
}

export function Text(props: TextProps) {
    const { style, lightColor, darkColor, fontWeight = 'regular', ...otherProps } = props;
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    const fontFamilyMap = {
        thin: 'IBMPlexSansThai-Thin',
        extraLight: 'IBMPlexSansThai-ExtraLight',
        light: 'IBMPlexSansThai-Light',
        regular: 'IBMPlexSansThai-Regular',
        medium: 'IBMPlexSansThai-Medium',
        semiBold: 'IBMPlexSansThai-SemiBold',
        bold: 'IBMPlexSansThai-Bold',
        extraBold: 'IBMPlexSansThai-ExtraBold',
        black: 'IBMPlexSansThai-Black',
    };

    return <DefaultText style={[{ color, fontFamily: fontFamilyMap[fontWeight] }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

    return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}