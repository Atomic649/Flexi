import { useTheme } from '@/providers/ThemeProvider';
import i18n from '../i18n/index';

export const useTextColorClass = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? 'text-zinc-100' : 'text-stone-600';
 
};


export const useBackgroundColorClass = () => {
  const { theme } = useTheme();

  // C1 - Background color based on theme
  return theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
 

};

