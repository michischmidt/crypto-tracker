import { env } from "@/env"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  saveSymbolsToCache,
  getSymbolsFromCache,
  isSymbolsCacheValid,
} from "@/utils/localstorage-helper"

export type Coin = {
  id: string
  symbol: string
  name: string
  image?: string
}

export type CoinGeckoSymbol = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
}

export const symbolsApiSlice = createApi({
  reducerPath: "symbolsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: env.VITE_COIN_GECKO_OPEN_MARKET_URL,
  }),
  tagTypes: ["Symbols"],
  endpoints: builder => ({
    getCoins: builder.query<Coin[], unknown>({
      query: () => "coins/list",
      providesTags: ["Symbols"],
    }),
    getTopCoins: builder.query<Coin[], unknown>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        // first check if we have valid cached data
        if (isSymbolsCacheValid()) {
          const cachedData = getSymbolsFromCache()
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log("Using cached symbols data")
            return { data: cachedData.data }
          }
        }

        // if no valid cache, fetch from API
        try {
          const response = await fetchWithBQ(
            "coins/markets?vs_currency=usd&order=market_cap_desc",
          )

          if (response.error) {
            return { error: response.error }
          }

          const transformedData = (response.data as CoinGeckoSymbol[]).map(
            coin => ({
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              image: coin.image,
            }),
          )

          saveSymbolsToCache(transformedData)

          return { data: transformedData }
        } catch (error) {
          // if API fails, try to use even expired cache as fallback
          const cachedData = getSymbolsFromCache()
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log(
              "API request failed, using expired cached data as fallback",
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
      providesTags: ["Symbols"],
    }),
  }),
})

export const { useGetCoinsQuery, useGetTopCoinsQuery } = symbolsApiSlice
