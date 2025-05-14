import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  saveSymbolsToCache,
  getSymbolsFromCache,
  isDataCacheValid,
  isSymbolsCacheValid,
  saveMarketDataToLocalStorageCache,
  getMarketDataFromLocalStorageCache,
  isMarketDataCacheValid,
} from "./localstorage-helper"
import type { Coin } from "@/features/symbols/symbolsApiSlice"
import type { MarketData } from "@/features/marketData/marketDataApiSlice"
import type { TimePeriod } from "@/shared/types/intervals"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: () => {
      store = {}
    },
  }
})()

// Replace the global localStorage with our mock
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock data
const mockCoins: Coin[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
]

const mockMarketData: MarketData[] = [
  {
    timestamp: 1620000000000,
    price: 50000,
    date: new Date(1620000000000).toISOString(),
  },
  {
    timestamp: 1620001000000,
    price: 51000,
    date: new Date(1620001000000).toISOString(),
  },
]

describe("localStorage helper utilities", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()

    // Reset mock function calls
    vi.clearAllMocks()

    // Mock Date.now() to return a consistent value for testing
    vi.spyOn(Date, "now").mockImplementation(() => 1620002000000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Symbols cache", () => {
    it("should save symbols to localStorage cache", () => {
      saveSymbolsToCache(mockCoins)

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "crypto-tracker-symbols",
        JSON.stringify({
          data: mockCoins,
          timestamp: 1620002000000,
        }),
      )
    })

    it("should get symbols from localStorage cache", () => {
      // Setup cache with data
      localStorageMock.setItem(
        "crypto-tracker-symbols",
        JSON.stringify({
          data: mockCoins,
          timestamp: 1620002000000,
        }),
      )

      const result = getSymbolsFromCache()

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "crypto-tracker-symbols",
      )
      expect(result).toEqual({
        data: mockCoins,
        timestamp: 1620002000000,
      })
    })

    it("should check if symbols cache is valid", () => {
      // Setup fresh cache
      localStorageMock.setItem(
        "crypto-tracker-symbols",
        JSON.stringify({
          data: mockCoins,
          timestamp: 1620002000000 - 30 * 60 * 1000, // 30 minutes ago
        }),
      )

      const result = isSymbolsCacheValid()

      expect(result).toBe(true)
    })

    it("should detect expired symbols cache", () => {
      // Setup expired cache
      localStorageMock.setItem(
        "crypto-tracker-symbols",
        JSON.stringify({
          data: mockCoins,
          timestamp: 1620002000000 - 2 * 60 * 60 * 1000, // 2 hours ago
        }),
      )

      const result = isSymbolsCacheValid()

      expect(result).toBe(false)
    })
  })

  describe("Market data cache", () => {
    const coinId = "bitcoin"
    const timePeriod: TimePeriod = "1W"

    it("should save market data to localStorage cache", () => {
      saveMarketDataToLocalStorageCache(coinId, timePeriod, mockMarketData)

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "crypto-tracker-market-data-bitcoin-1W",
        JSON.stringify({
          data: mockMarketData,
          timestamp: 1620002000000,
        }),
      )
    })

    it("should get market data from localStorage cache", () => {
      // Setup cache with data
      localStorageMock.setItem(
        "crypto-tracker-market-data-bitcoin-1W",
        JSON.stringify({
          data: mockMarketData,
          timestamp: 1620002000000,
        }),
      )

      const result = getMarketDataFromLocalStorageCache(coinId, timePeriod)

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "crypto-tracker-market-data-bitcoin-1W",
      )
      expect(result).toEqual({
        data: mockMarketData,
        timestamp: 1620002000000,
      })
    })

    it("should return null when market data cache is empty", () => {
      const result = getMarketDataFromLocalStorageCache(coinId, timePeriod)

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
    })

    it("should check if market data cache is valid", () => {
      // Setup fresh cache
      localStorageMock.setItem(
        "crypto-tracker-market-data-bitcoin-1W",
        JSON.stringify({
          data: mockMarketData,
          timestamp: 1620002000000 - 30 * 60 * 1000, // 30 minutes ago
        }),
      )

      const result = isMarketDataCacheValid(coinId, timePeriod)

      expect(result).toBe(true)
    })

    it("should detect expired market data cache", () => {
      // Setup expired cache
      localStorageMock.setItem(
        "crypto-tracker-market-data-bitcoin-1W",
        JSON.stringify({
          data: mockMarketData,
          timestamp: 1620002000000 - 2 * 60 * 60 * 1000, // 2 hours ago
        }),
      )

      const result = isMarketDataCacheValid(coinId, timePeriod)

      expect(result).toBe(false)
    })
  })

  describe("Data cache validation", () => {
    it("should validate cache with custom max age", () => {
      const cachedData = {
        data: ["test"],
        timestamp: 1620002000000 - 2 * 60 * 1000, // 2 minutes ago
      }

      // Valid with 5-minute max age
      expect(isDataCacheValid(cachedData, 5 * 60 * 1000)).toBe(true)

      // Invalid with 1-minute max age
      expect(isDataCacheValid(cachedData, 1 * 60 * 1000)).toBe(false)
    })

    it("should handle null cached data", () => {
      expect(isDataCacheValid(null)).toBe(false)
    })
  })

  describe("Error handling", () => {
    it("should handle localStorage setItem errors", () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded")
      })

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      saveSymbolsToCache(mockCoins)

      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy.mock.calls[0][0]).toContain(
        "Failed to save data to cache",
      )
    })
  })
})
