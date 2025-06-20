import { Stack } from "expo-router"
import React from "react"
import { useTranslation } from 'react-i18next'

export default function AuthLayout() {
  const { i18n } = useTranslation()

  return (
    <>
      <Stack screenOptions={{
        headerTitleStyle: {
          fontFamily: i18n.language === 'th' ? "NotoSansThai-Regular" : "Poppins-Regular",
        }
      }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="business_register" options={{ headerShown: false }} />
        <Stack.Screen name="forgot_password" options={{ headerShown: false }} />
        <Stack.Screen name="change_password" options={{ headerShown: false }} />
        <Stack.Screen name="delete_account" options={{ headerShown: false }} />
       

      </Stack>
    </>
  )
}
