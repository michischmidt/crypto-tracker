import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/app/store"
import { TimePeriod } from "@/shared/types/intervals"

export type MarketDataState = {
  selectedTimePeriod: TimePeriod
}

const initialState: MarketDataState = {
  selectedTimePeriod: TimePeriod.WEEK,
}

export const marketDataSlice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    setSelectedTimePeriod: (state, action: PayloadAction<TimePeriod>) => {
      state.selectedTimePeriod = action.payload
    },
  },
})

export const { setSelectedTimePeriod } = marketDataSlice.actions
export const selectSelectedTimePeriod = (state: RootState) =>
  state.marketData.selectedTimePeriod

export default marketDataSlice.reducer
