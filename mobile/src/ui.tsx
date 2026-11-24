import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export const colors = {
  background: '#F7F4EC',
  card: '#FFFEFA',
  ink: '#233729',
  muted: '#536256',
  accent: '#2D573F',
  line: '#DEDCD0',
  soft: '#E7EFE2',
  error: '#8B302A',
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 24, gap: 16 },
  title: { fontSize: 38, fontWeight: '800', color: colors.ink, letterSpacing: -1.5 },
  heading: { fontSize: 23, fontWeight: '700', color: colors.ink },
  detail: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  error: { color: colors.error, fontSize: 15, lineHeight: 22 },
})

export function Button({ children, onPress, disabled, secondary, label }: {
  children: ReactNode
  onPress: () => void
  disabled?: boolean
  secondary?: boolean
  label?: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48, justifyContent: 'center', borderRadius: 14, paddingHorizontal: 16,
        backgroundColor: secondary ? colors.soft : colors.accent,
        opacity: pressed || disabled ? 0.55 : 1,
      })}>
      <Text style={{ color: secondary ? colors.ink : '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
        {children}
      </Text>
    </Pressable>
  )
}

export function ErrorNotice({ message, retry }: { message: string; retry: () => void }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="alert" style={styles.error}>{message}</Text>
      <View style={styles.row}><Button secondary onPress={retry}>Refresh</Button></View>
    </View>
  )
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function elapsed(timestamp: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000))
  if (minutes === 0) return 'Just now'
  const units = [
    [Math.floor(minutes / 1440), 'day'],
    [Math.floor(minutes / 60) % 24, 'hour'],
    [minutes % 60, 'minute'],
  ] as const
  const parts = units
    .filter(([count]) => count > 0)
    .slice(0, 2)
    .map(([count, unit]) => `${count} ${unit}${count === 1 ? '' : 's'}`)
  return `${parts.join(', ')} ago`
}
