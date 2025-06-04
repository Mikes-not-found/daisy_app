/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { useColorScheme } from "react-native";

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#6B7280',
    background: '#F8F8FF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8F8FF',
    background: 'black',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const ColorPalette = {
  primary: '#20AB6E',
  lime: '#D7FFD4',
  pink: '#F655FF',
  brown: '#29271D',
  sky: '#E5EDFF',
  teal: '#0E4D45',
  yellow: '#FCBB80',
  orange: '#EF580B',
  blue: '#0000FA',
  green: '#172E15',
  light: '#FFFCFF',
  grey: '#343434',
  greyLight: '#B8B3BA',
  input: '#EEE9F0',
  selected: '#F7F2F9',
  dark: '#2F2D32',
  purple: '#7B70F9',
};
