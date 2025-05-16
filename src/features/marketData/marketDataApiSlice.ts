import { env } from "@/env";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TimePeriod } from "@/shared/types/intervals";
import {
  saveMarketDataToLocalStorageCache,
  getMarketDataFromLocalStorageCache,
  isMarketDataCacheValid,
} from "@/utils/localstorage-helper";
import { getTimePeriodDays } from "@/utils/interval-helper";
import type { CoinPriceData } from "@/shared/types/coins";

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
  tagTypes: ["MarketData", "CoinPrices", "TokenPrices"],
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
          const url = `coins/${coinId}/market_chart?vs_currency=usd&days=${String(days)}&interval=daily`;

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
    getTokenPricesByContract: builder.query<
      Record<string, { usd: number }>,
      { contractAddresses: string[]; chainId?: number }
    >({
      query: ({ contractAddresses, chainId = 56 }) => {
        // Use the appropriate platform based on chain ID
        const platform = chainId === 1 ? "ethereum" : "binance-smart-chain";
        const addressesParam = contractAddresses.join(",");
        return `coins/${platform}/contract/${addressesParam}`;
      },
      transformResponse: (response: Record<string, { usd: number }>) =>
        response,
      keepUnusedDataFor: 300, // Cache for 5 minutes in RTK Query
      providesTags: result =>
        result
          ? [
              ...Object.keys(result).map(address => ({
                type: "TokenPrices" as const,
                id: address,
              })),
              { type: "TokenPrices", id: "LIST" },
            ]
          : [{ type: "TokenPrices", id: "LIST" }],
    }),

    // Get token price by single contract address
    getTokenPrice: builder.query<
      { usd: number },
      { contractAddress: string; chainId?: number }
    >({
      query: ({ contractAddress, chainId = 56 }) => {
        // Use the appropriate platform based on chain ID
        const platform = chainId === 1 ? "ethereum" : "binance-smart-chain";
        return `coins/${platform}/contract/${contractAddress}/market_chart?vs_currency=usd&days=1&include_last_updated_at=true`;
      },
      transformResponse: (response: { prices?: [number, number][] }) => {
        // Extract the most recent price
        if (response.prices && response.prices.length > 0) {
          const latestPrice = response.prices[response.prices.length - 1][1];
          return { usd: latestPrice };
        }
        return { usd: 0 };
      },
      providesTags: (_result, _error, { contractAddress }) => [
        { type: "TokenPrices", id: contractAddress },
      ],
    }),

    getCoinPrices: builder.query<CoinPriceData[], { coinIds: string[] }>({
      query: ({ coinIds }) => {
        const idsParam = coinIds.join(",");
        return `coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`;
      },
      providesTags: (result, _error, _arg) =>
        result
          ? [
              ...result.map(coin => ({
                type: "CoinPrices" as const,
                id: coin.id,
              })),
              { type: "CoinPrices", id: "LIST" },
            ]
          : [{ type: "CoinPrices", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMarketDataQuery,
  useGetCoinPricesQuery,
  useGetTokenPriceQuery,
  useGetTokenPricesByContractQuery,
} = marketDataApiSlice;
