import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { Alert, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api, type Feeding } from '../../api'
import { Button, ErrorNotice, errorMessage, styles } from '../../ui'

export default function History() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>()
  const catId = Number(id)
  const [entries, setEntries] = useState<Feeding[]>([])
  const [cursor, setCursor] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
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
      setBusy(false)
      setLoading(false)
    }
  }, [])

  const load = useCallback((before?: number) => {
    void run(async () => {
      if (!Number.isSafeInteger(catId) || catId < 1) throw new Error('This cat could not be found.')
      const page = await api.history(catId, before)
      setEntries(previous => before === undefined ? page : [...previous, ...page])
      setCursor(page.length === 30 ? page[page.length - 1].id : undefined)
      setLoaded(true)
    }, before === undefined)
  }, [catId, run])

  useFocusEffect(useCallback(() => load(), [load]))

  function confirmRemove(entry: Feeding) {
    Alert.alert('Remove feeding?', new Date(entry.fed_at).toLocaleString(), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => void run(async () => {
          await api.remove(catId, entry.id)
          setEntries(previous => previous.filter(feeding => feeding.id !== entry.id))
        }),
      },
    ])
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={entry => String(entry.id)}
        refreshing={loading}
        onRefresh={() => load()}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            {name ? <Text accessibilityRole="header" style={styles.title}>{name}</Text> : null}
            {error ? <ErrorNotice message={error} retry={() => load()} /> : null}
          </View>
        }
        ListEmptyComponent={loaded && !cursor ? <Text style={styles.detail}>No feedings recorded.</Text> : undefined}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.row]}>
            <Text style={[styles.detail, { flex: 1 }]}>{new Date(item.fed_at).toLocaleString()}</Text>
            <Button secondary disabled={busy} onPress={() => confirmRemove(item)}>Remove</Button>
          </View>
        )}
        ListFooterComponent={cursor ? (
          <Button secondary disabled={busy} onPress={() => load(cursor)}>Load older feedings</Button>
        ) : undefined}
      />
    </SafeAreaView>
  )
}
