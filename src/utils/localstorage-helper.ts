import type { Coin } from "@/features/symbols/symbolsApiSlice"
import type { MarketData } from "@/features/marketData/marketDataApiSlice"
import type { TimePeriod } from "@/shared/types/intervals"

type CachedData<T> = {
  data: T
  timestamp: number
}

enum StorageKeys {
  SYMBOLS = "crypto-tracker-symbols",
  MARKET_DATA = "crypto-tracker-market-data",
}

const saveToLocalStorageCache = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error(`Failed to save data to cache (${key}):`, error)
  }
}

export const saveSymbolsToCache = (symbols: Coin[]): void => {
  saveToLocalStorageCache(StorageKeys.SYMBOLS, symbols)
}

const getFromLocalStorageCache = <T>(key: string): CachedData<T> | null => {
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      return JSON.parse(cached) as {
        data: T
        timestamp: number
      }
    }
    return null
  } catch (error) {
    console.error(`Failed to get data from cache (${key}):`, error)
    return null
  }
}

export const getSymbolsFromCache = (): CachedData<Coin[]> | null => {
  return getFromLocalStorageCache<Coin[]>(StorageKeys.SYMBOLS)
}

/**
 * Generic function to check if cached data is still valid based on its timestamp
 * Default cache duration is 1 hour for all data types
 */
export const isDataCacheValid = <T>(
  cached: CachedData<T> | null,
  maxAgeMs = 60 * 60 * 1000, // 1 hour default for all cache types
): boolean => {
  if (!cached) return false

  const now = Date.now()
  return now - cached.timestamp < maxAgeMs
}

export const isSymbolsCacheValid = (): boolean => {
  const cached = getSymbolsFromCache()
  return isDataCacheValid<Coin[]>(cached)
}

/**
 * Helper to generate a unique key for each coin ID and timeframe
 */
const getMarketDataKey = (coinId: string, timePeriod: TimePeriod): string => {
  return `${StorageKeys.MARKET_DATA}-${coinId}-${timePeriod}`
}

export const saveMarketDataToLocalStorageCache = (
  coinId: string,
  timePeriod: TimePeriod,
  data: MarketData[],
): void => {
  saveToLocalStorageCache(getMarketDataKey(coinId, timePeriod), data)
}

export const getMarketDataFromLocalStorageCache = (
  coinId: string,
  timePeriod: TimePeriod,
): CachedData<MarketData[]> | null => {
  return getFromLocalStorageCache<MarketData[]>(
    getMarketDataKey(coinId, timePeriod),
  )
}

export const isMarketDataCacheValid = (
  coinId: string,
  timePeriod: TimePeriod,
): boolean => {
  const cached = getMarketDataFromLocalStorageCache(coinId, timePeriod)
  return isDataCacheValid(cached)
}
