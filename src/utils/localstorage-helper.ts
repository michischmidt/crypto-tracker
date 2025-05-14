import type { Coin } from "@/features/symbols/symbolsApiSlice"
import type { MarketData } from "@/features/marketData/marketDataApiSlice"
import type { TimePeriod } from "@/shared/types/intervals"

type CachedData<T> = {
  data: T
  timestamp: number
}

// Storage keys for different data types
enum StorageKeys {
  SYMBOLS = "crypto-tracker-symbols",
  MARKET_DATA = "crypto-tracker-market-data"
}

/**
 * Generic function to save data to localStorage with a timestamp
 */
const saveToCache = (key: string, data: unknown): void => {
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

/**
 * Saves symbols data to localStorage
 */
export const saveSymbolsToCache = (symbols: Coin[]): void => {
  saveToCache(StorageKeys.SYMBOLS, symbols)
}

/**
 * Generic function to retrieve data from localStorage with timestamp
 */
const getFromCache = <T>(key: string): CachedData<T> | null => {
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

/**
 * Retrieves symbols data from localStorage
 */
export const getSymbolsFromCache = (): CachedData<Coin[]> | null => {
  return getFromCache<Coin[]>(StorageKeys.SYMBOLS)
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

/**
 * Checks if symbols cache is valid (uses default 1 hour cache duration)
 */
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

/**
 * Saves market data to localStorage
 */
export const saveMarketDataToCache = (
  coinId: string,
  timePeriod: TimePeriod,
  data: MarketData[],
): void => {
  saveToCache(getMarketDataKey(coinId, timePeriod), data)
}

/**
 * Retrieves market data from localStorage
 */
export const getMarketDataFromCache = (
  coinId: string,
  timePeriod: TimePeriod,
): CachedData<MarketData[]> | null => {
  return getFromCache<MarketData[]>(getMarketDataKey(coinId, timePeriod))
}

/**
 * Checks if market data cache is valid (uses default 1 hour cache duration)
 */
export const isMarketDataCacheValid = (
  coinId: string,
  timePeriod: TimePeriod,
): boolean => {
  const cached = getMarketDataFromCache(coinId, timePeriod)
  return isDataCacheValid(cached)
}
