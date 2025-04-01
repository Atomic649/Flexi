// rnf
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from '@/providers/ThemeProvider';
import { useBackgroundColorClass } from '@/utils/themeUtils';

export default function Create() {
  const { theme } = useTheme();
  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
         <View>
         
         </View>
       </SafeAreaView>
     )
   }