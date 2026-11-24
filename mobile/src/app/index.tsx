import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api, type Cat } from '../api'
import { Button, colors, elapsed, ErrorNotice, errorMessage, styles } from '../ui'

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([])
  const [name, setName] = useState('')
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const locked = useRef(false)

  const run = useCallback(async (operation: () => Promise<void>, refresh = false) => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setLoading(refresh)
    setError('')
    try {
      await operation()
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      locked.current = false
      setLoading(false)
      setBusy(false)
    }
  }, [])

  const refresh = useCallback(() => {
    void run(async () => {
      setCats(await api.cats())
      setNow(Date.now())
      setLoaded(true)
    }, true)
  }, [run])

  useFocusEffect(refresh)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [])

  function addCat() {
    const trimmed = name.trim()
    if (!trimmed) return
    void run(async () => {
      const cat = await api.addCat(trimmed)
      setCats(previous => [...previous, cat])
      setName('')
    })
  }

  function feedCat(id: number) {
    void run(async () => {
      const entry = await api.feed(id)
      setCats(previous => previous.map(cat => cat.id === id ? { ...cat, last_fed_at: entry.fed_at } : cat))
      setNow(Date.now())
    })
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <Text accessibilityRole="header" style={styles.title}>Cat Feeding</Text>
        {error ? <ErrorNotice message={error} retry={refresh} /> : null}
        {loaded && (
          <>
            <View style={styles.row}>
              <TextInput
                accessibilityLabel="Cat name"
                placeholder="Cat name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={name}
                onChangeText={setName}
                maxLength={60}
                editable={!busy}
                returnKeyType="done"
                onSubmitEditing={addCat}
              />
              <Button disabled={busy || !name.trim()} onPress={addCat}>Add cat</Button>
            </View>
            {cats.length === 0 && <Text style={styles.detail}>Add your first cat to start tracking meals.</Text>}
            {cats.map(cat => (
              <View style={styles.card} key={cat.id}>
                <View style={styles.row}>
                  <Text accessible={false} style={styles.avatar}>🐱</Text>
                  <Text accessibilityRole="header" style={[styles.heading, { flexShrink: 1 }]}>{cat.name}</Text>
                </View>
                <Text style={styles.heading}>{cat.last_fed_at === null ? 'No feedings yet' : elapsed(cat.last_fed_at, now)}</Text>
                {cat.last_fed_at !== null && <Text style={styles.detail}>Last fed {new Date(cat.last_fed_at).toLocaleString()}</Text>}
                <View style={styles.row}>
                  <Button label={`Feed ${cat.name} now`} disabled={busy} onPress={() => feedCat(cat.id)}>Feed now</Button>
                  <Button secondary label={`Feeding history for ${cat.name}`} disabled={busy}
                    onPress={() => router.push({ pathname: '/history/[id]', params: { id: String(cat.id), name: cat.name } })}>
                    History
                  </Button>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
