import type { Coin } from "@/features/symbols/symbolsApiSlice"

const STORAGE_KEY = "crypto-tracker-symbols"

export const saveSymbolsToCache = (symbols: Coin[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        symbols,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Failed to save symbols to cache:", error)
  }
}

export const getSymbolsFromCache = (): {
  symbols: Coin[]
  timestamp: number
} | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsedCache = JSON.parse(cached) as {
        symbols: Coin[]
        timestamp: number
      }
      return parsedCache
    }
    return null
  } catch (error) {
    console.error("Failed to get symbols from cache:", error)
    return null
  }
}

export const isCacheValid = (maxAgeMs = 24 * 60 * 60 * 1000) => {
  const cached = getSymbolsFromCache()
  if (!cached) return false

  const now = Date.now()
  return now - cached.timestamp < maxAgeMs
}
