import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export type SymbolsState = {
  selectedSymbol: string;
  selectedId: string;
};

const initialState: SymbolsState = {
  selectedSymbol: "BTC",
  selectedId: "bitcoin",
};

export const symbolsSlice = createSlice({
  name: "symbols",
  initialState,
  reducers: {
    setSelectedSymbol: (
      state,
      action: PayloadAction<{ id: string; symbol: string }>,
    ) => {
      state.selectedSymbol = action.payload.symbol;
      state.selectedId = action.payload.id;
    },
  },
});

export const { setSelectedSymbol } = symbolsSlice.actions;
export const selectSelectedSymbol = (state: RootState) =>
  state.symbols.selectedSymbol;
export const selectSelectedId = (state: RootState) => state.symbols.selectedId;

export default symbolsSlice.reducer;
