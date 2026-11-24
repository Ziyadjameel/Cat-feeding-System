import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../ui'

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="history/[id]" options={{ title: 'Feeding history' }} />
      </Stack>
    </>
  )
}
