import { Platform } from 'react-native'

const localHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
const baseUrl = (process.env.EXPO_PUBLIC_API_URL || `http://${localHost}:8000`).replace(/\/+$/, '')

export type Cat = { id: number; name: string; last_fed_at: number | null }
export type Feeding = { id: number; fed_at: number }

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

export const api = {
  cats: () => request<Cat[]>('/cats', response => response.json()),
  addCat: (name: string) => request<Cat>('/cats', response => response.json(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }),
  feed: (id: number) => request<Feeding>(`/cats/${id}/feedings`, response => response.json(), { method: 'POST' }),
  history: (id: number, before?: number) => request<Feeding[]>(
    `/cats/${id}/feedings${before ? `?before=${before}` : ''}`,
    response => response.json(),
  ),
  remove: (catId: number, feedingId: number) => request(
    `/cats/${catId}/feedings/${feedingId}`,
    async () => {},
    { method: 'DELETE' },
  ),
}
