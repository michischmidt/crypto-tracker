import { env } from "@/env";
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { TimePeriod } from "@/shared/types/intervals";
import {
  saveMarketDataToLocalStorageCache,
  getMarketDataFromLocalStorageCache,
  isMarketDataCacheValid,
} from "@/utils/localstorage-helper";
import { getTimePeriodDays } from "@/utils/interval-helper";

export type MarketData = {
  timestamp: number;
  price: number;
  date: string; // ISO date
};

type CoinGeckoMarketChartResponse = {
  prices: [number, number][]; // [timestamp, price] pairs
};

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
      async queryFn(
        arg: { coinId: string; timePeriod: TimePeriod },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        const { coinId, timePeriod } = arg;

        if (isMarketDataCacheValid(coinId, timePeriod)) {
          const cachedData = getMarketDataFromLocalStorageCache(
            coinId,
            timePeriod,
          );
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log(
              `Using cached market data for ${coinId} (${timePeriod})`,
            );
            return { data: cachedData.data };
          }
        }

        // if no valid cache, fetch from API
        try {
          const days = getTimePeriodDays(timePeriod);
          const url = `coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;

          const response = await fetchWithBQ(url);
          const data = response.data as CoinGeckoMarketChartResponse;

          const transformedData = data.prices.map(
            ([timestamp, price]): MarketData => ({
              timestamp,
              price,
              date: new Date(timestamp).toISOString(),
            }),
          );

          saveMarketDataToLocalStorageCache(
            coinId,
            timePeriod,
            transformedData,
          );

          return { data: transformedData };
        } catch (error) {
          // try using expired cache as fallback
          const cachedData = getMarketDataFromLocalStorageCache(
            coinId,
            timePeriod,
          );
          if (cachedData?.data && cachedData.data.length > 0) {
            console.log(
              `API request failed, using expired cached data for ${coinId}`,
            );
            return { data: cachedData.data };
          }

          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : String(error),
              meta:
                error instanceof Error && error.message.includes("429")
                  ? { httpStatus: 429, reason: "RATE_LIMIT" }
                  : undefined,
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: (_result, _error, arg) => [
        { type: "MarketData" as const, id: `${arg.coinId}-${arg.timePeriod}` },
      ],
    }),
  }),
});

export const { useGetMarketDataQuery } = marketDataApiSlice;
