import { Platform } from 'react-native'

const localHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
const baseUrl = (process.env.EXPO_PUBLIC_API_URL || `http://${localHost}:8000`).replace(/\/+$/, '')

async function request<T>(path: string, readBody: (response: Response) => Promise<T>, options?: RequestInit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    let response: Response
    try {
      response = await fetch(baseUrl + path, { ...options, signal: controller.signal })
    } catch {
      throw new Error('Couldn’t reach the feeding API. Check your connection and refresh before retrying.')
    }
    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(typeof error?.detail === 'string' ? error.detail : 'The API couldn’t complete the request.')
    }
    return await readBody(response)
  } finally {
    clearTimeout(timeout)
  }
}

type LastFeeding = { last_fed_at: number | null }

export const api = {
  lastFeeding: () => request<LastFeeding>('/feeding', response => response.json()),
  feed: () => request<LastFeeding>('/feeding', response => response.json(), { method: 'POST' }),
}
