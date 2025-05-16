import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export enum SupportedChain {
  Ethereum = 1,
  BNBSmartChain = 56,
  Linea = 59144,
  LineaSepolia = 59141,
}

export const CHAIN_NAMES: Record<SupportedChain, string> = {
  [SupportedChain.Ethereum]: "Ethereum",
  [SupportedChain.BNBSmartChain]: "BNB Smart Chain",
  [SupportedChain.Linea]: "Linea",
  [SupportedChain.LineaSepolia]: "Linea Sepolia",
};

export const ALCHEMY_URLS: Record<SupportedChain, string> = {
  [SupportedChain.Ethereum]:
    "https://eth-mainnet.g.alchemy.com/v2/hwpATLIKNp3XoZLTShE9T5A2jeOnhM6f",
  [SupportedChain.BNBSmartChain]:
    "https://bnb-mainnet.g.alchemy.com/v2/hwpATLIKNp3XoZLTShE9T5A2jeOnhM6f",
  [SupportedChain.Linea]: "",
  [SupportedChain.LineaSepolia]: "",
};

type WalletState = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  isChainSupported: boolean;
};

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  isChainSupported: false,
};

export const walletIntegrationSlice = createSlice({
  name: "walletIntegration",
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setChainId: (state, action: PayloadAction<number | null>) => {
      state.chainId = action.payload;

      // Update chain support status
      if (action.payload === null) {
        state.isChainSupported = false;
      } else {
        state.isChainSupported = Object.values(SupportedChain).includes(
          action.payload,
        );
      }
    },
    updateWalletState: (
      state,
      action: PayloadAction<{
        address: string | null;
        isConnected: boolean;
        chainId: number | null;
      }>,
    ) => {
      const { address, isConnected, chainId } = action.payload;
      state.address = address;
      state.isConnected = isConnected;
      state.chainId = chainId;

      // Update chain support status
      if (chainId === null) {
        state.isChainSupported = false;
      } else {
        state.isChainSupported =
          Object.values(SupportedChain).includes(chainId);
      }
    },
  },
});

export const {
  setWalletAddress,
  setConnectionStatus,
  setChainId,
  updateWalletState,
} = walletIntegrationSlice.actions;

// Selectors
export const selectWalletAddress = (state: RootState) =>
  state[walletIntegrationSlice.name].address;
export const selectIsConnected = (state: RootState) =>
  state[walletIntegrationSlice.name].isConnected;
export const selectChainId = (state: RootState) =>
  state[walletIntegrationSlice.name].chainId;
export const selectIsChainSupported = (state: RootState) =>
  state[walletIntegrationSlice.name].isChainSupported;

export default walletIntegrationSlice.reducer;
