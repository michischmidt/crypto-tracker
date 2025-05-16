import { useAccount } from "wagmi";
import { useMemo } from "react";
import { SupportedChain, ALCHEMY_URLS } from "./walletIntegrationSlice";

export const useWalletIntegration = () => {
  const { address, isConnected, chain } = useAccount();
  const chainId = chain?.id ?? null;
  
  // Determine if the current chain is supported
  const isChainSupported = chainId !== null && Object.values(SupportedChain).includes(chainId);

  // Memoize the Alchemy URL based on the current chain to prevent infinite render loops
  const alchemyUrl = useMemo(() => {
    if (!chainId) return ALCHEMY_URLS[SupportedChain.Ethereum]; // Default
    
    return ALCHEMY_URLS[chainId as SupportedChain] || ALCHEMY_URLS[SupportedChain.Ethereum];
  }, [chainId]);
  
  // Create a stable function reference that doesn't change between renders
  const getAlchemyUrl = useMemo(() => {
    return () => alchemyUrl;
  }, [alchemyUrl]);

  return {
    address,
    isConnected: !!isConnected,
    chainId,
    isChainSupported,
    getAlchemyUrl,
  };
};
