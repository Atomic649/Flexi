import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React from "react"

export default function AuthLayout() {
  return (
    <>
      {/* Custom Statusbar */}
      <StatusBar style="light" backgroundColor="#161622" />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
