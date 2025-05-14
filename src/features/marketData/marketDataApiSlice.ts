import { env } from "@/env"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { TimePeriod } from "@/shared/types/intervals"
import {
  saveMarketDataToLocalStorageCache,
  getMarketDataFromLocalStorageCache,
  isMarketDataCacheValid,
} from "@/utils/localstorage-helper"
import { getTimePeriodDays } from "@/utils/interval-helper"

export type MarketData = {
  timestamp: number
  price: number
  date: string // ISO date
}

type CoinGeckoMarketChartResponse = {
  prices: [number, number][] // [timestamp, price] pairs
}

export const marketDataApiSlice = createApi({
  reducerPath: "marketDataApi",
  baseQuery: fetchBaseQuery({
    baseUrl: env.VITE_COIN_GECKO_OPEN_MARKET_URL,
  }),
  tagTypes: ["MarketData"],
  endpoints: builder => ({
    getMarketData: builder.query<
      MarketData[],
      { coinId: string; timePeriod: TimePeriod }
    >({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { coinId, timePeriod } = arg

        // first check if we have valid cached data
        if (isMarketDataCacheValid(coinId, timePeriod)) {
          const cachedData = getMarketDataFromLocalStorageCache(
            coinId,
            timePeriod,
          )
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log(
              `Using cached market data for ${coinId} (${timePeriod})`,
            )
            return { data: cachedData.data }
          }
        }

        // if no valid cache, fetch from API
        try {
          const days = getTimePeriodDays(timePeriod)

          // fetch day to day market data
          const response = await fetchWithBQ(
            "coins/" +
              coinId +
              "/market_chart?vs_currency=usd&days=" +
              days.toString() +
              "&interval=daily",
          )

          if (response.error) {
            return { error: response.error }
          }

          const data = response.data as CoinGeckoMarketChartResponse

          // transform in our marke data format for chart
          const transformedData = data.prices.map(
            ([timestamp, price]): MarketData => ({
              timestamp,
              price,
              date: new Date(timestamp).toISOString(),
            }),
          )

          saveMarketDataToLocalStorageCache(coinId, timePeriod, transformedData)

          return { data: transformedData }
        } catch (error) {
          // if API fails, try to use even expired cache as fallback
          const cachedData = getMarketDataFromLocalStorageCache(
            coinId,
            timePeriod,
          )
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log(
              `API request failed, using expired cached data as fallback for ${coinId} (${timePeriod})`,
            )
            return { data: cachedData.data }
          }

          return {
            error: {
              status: "FETCH_ERROR",
              error: String(error),
            },
          }
        }
      },
      providesTags: (_result, _error, arg) => [
        { type: "MarketData" as const, id: arg.coinId + "-" + arg.timePeriod },
      ],
    }),
  }),
})

export const { useGetMarketDataQuery } = marketDataApiSlice
