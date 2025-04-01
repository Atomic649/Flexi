import { Stack } from "expo-router"
import React from "react"
import { useTranslation } from 'react-i18next'

export default function toolBarLayout() {
  const { i18n } = useTranslation()

  return (
    <>
      <Stack screenOptions={{
        headerTitleStyle: {
          fontFamily: i18n.language === 'th' ? "NotoSansThai-Regular" : "Poppins-Regular",
        }
        
      }}>
        <Stack.Screen name="ads" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />        
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="store" options={{ headerShown: false }} />
        
        
      </Stack>
    </>
  )
}
