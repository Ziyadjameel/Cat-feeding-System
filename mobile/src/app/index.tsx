import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { api } from '../api'
import { Button, elapsed, ErrorNotice, errorMessage, styles } from '../ui'

export default function Home() {
  const [lastFed, setLastFed] = useState<number | null>()
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const locked = useRef(false)

  const run = useCallback(async (operation: typeof api.lastFeeding) => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try {
      const result = await operation()
      setLastFed(result.last_fed_at)
      setNow(Date.now())
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      locked.current = false
      setBusy(false)
    }
  }, [])

  const refresh = useCallback(() => { void run(api.lastFeeding) }, [run])
  useFocusEffect(refresh)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Cat Feeding</Text>
        <View style={styles.card}>
          <Text style={styles.detail}>Last fed</Text>
          <Text style={styles.heading}>
            {lastFed === undefined ? (busy ? 'Loading…' : 'Unavailable') :
              lastFed === null ? 'No feedings yet' : elapsed(lastFed, now)}
          </Text>
          {typeof lastFed === 'number' && (
            <Text style={styles.detail}>{new Date(lastFed).toLocaleString()}</Text>
          )}
          <Button disabled={busy} onPress={() => void run(api.feed)}>Feed now</Button>
        </View>
        {error ? <ErrorNotice message={error} retry={refresh} /> : null}
      </ScrollView>
    </SafeAreaView>
  )
}
