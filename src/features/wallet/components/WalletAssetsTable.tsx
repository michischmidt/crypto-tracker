/* eslint-disable @typescript-eslint/no-deprecated */
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBalance } from "wagmi";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useGetCoinPricesQuery } from "@/features/marketData/marketDataApiSlice";
import { WalletAssetRow } from "./WalletAssetRow";
import { useWalletIntegration } from "@/features/walletIntegration/walletIntegrationHooks";
import { SupportedChain } from "@/features/walletIntegration/walletIntegrationSlice";

type TokenBalance = {
  contractAddress: string;
  tokenBalance: string;
};

type TokenBalancesResponse = {
  jsonrpc: string;
  id: number;
  result: {
    address: string;
    tokenBalances: TokenBalance[];
  };
};

export const WalletAssetsTable = () => {
  const { address, isConnected, chainId, isChainSupported, getAlchemyUrl } =
    useWalletIntegration();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: currentAsset } = useBalance({ address });
  const [tokenValues, setTokenValues] = useState<Record<string, number>>({});

  // Add a function to update token values from child components - using useCallback to prevent recreating on every render
  const updateTokenValue = useCallback(
    (tokenAddress: string, value: number | null) => {
      setTokenValues(prev => ({
        ...prev,
        [tokenAddress]: value ?? 0,
      }));
    },
    [],
  );

  const nativeAssetId =
    chainId === SupportedChain.BNBSmartChain ? "binancecoin" : "ethereum";
  const { data: nativePriceData } = useGetCoinPricesQuery(
    { coinIds: [nativeAssetId] },
    { skip: !isConnected },
  );

  // Calculate native asset value
  const nativeAssetValue = useMemo(() => {
    if (!currentAsset || !nativePriceData || nativePriceData.length === 0)
      return null;
    const price = nativePriceData[0]?.current_price ?? 0;
    const balance = parseFloat(currentAsset.formatted);
    return balance * price;
  }, [currentAsset, nativePriceData]);

  // Get native asset price
  const nativeAssetPrice = nativePriceData?.length
    ? (nativePriceData[0]?.current_price ?? 0)
    : 0;

  // Calculate total portfolio value (native asset + all tokens)
  const portfolioTotal = useMemo(() => {
    const tokenTotal = Object.values(tokenValues).reduce(
      (sum, value) => sum + value,
      0,
    );
    return (nativeAssetValue ?? 0) + tokenTotal;
  }, [nativeAssetValue, tokenValues]);

  // Fetch token balances when address or chain changes
  useEffect(() => {
    // Skip if there's no address
    if (!address) return;

    // Skip if not connected or chain isn't supported
    if (!isConnected || !isChainSupported) return;

    // Store URL in a variable to avoid calling function in the async function
    const currentUrl = getAlchemyUrl();

    const fetchTokenBalances = async () => {
      try {
        setIsLoading(true);

        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };
        const body = JSON.stringify({
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address, "erc20"],
        });

        const response = await fetch(currentUrl, {
          method: "POST",
          headers: headers,
          body: body,
        });
        const data = (await response.json()) as TokenBalancesResponse;

        setTokenBalances(data.result.tokenBalances);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTokenBalances();
  }, [address, chainId, isConnected, isChainSupported, getAlchemyUrl]);

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Connect your wallet to view assets
        </p>
      </Card>
    );
  }

  if (!isChainSupported) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-2 font-medium">Unsupported Network</p>
        <p className="text-muted-foreground">
          The selected network is not supported. Please switch to Ethereum or
          BNB Smart Chain.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>Your crypto wallet assets</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Asset</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {/* Show native token (BNB/ETH) if available */}
              {currentAsset && (
                <TableRow>
                  <TableCell className="font-medium">
                    {currentAsset.symbol}
                  </TableCell>
                  <TableCell>
                    {currentAsset.symbol === "BNB"
                      ? "Binance Coin"
                      : currentAsset.symbol === "ETH"
                        ? "Ethereum"
                        : currentAsset.symbol}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentAsset.formatted}
                  </TableCell>
                  <TableCell className="text-right">
                    {nativePriceData ? (
                      `$${nativeAssetPrice.toFixed(2)}`
                    ) : (
                      <Skeleton className="ml-auto h-4 w-20" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {nativeAssetValue ? (
                      `$${nativeAssetValue.toFixed(2)}`
                    ) : (
                      <Skeleton className="ml-auto h-4 w-24" />
                    )}
                  </TableCell>
                </TableRow>
              )}

              {tokenBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center">
                    <p className="text-muted-foreground">
                      No ERC20 tokens found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                tokenBalances.map(token => (
                  <WalletAssetRow
                    key={token.contractAddress}
                    contractAddress={token.contractAddress}
                    chainId={chainId}
                    onValueChange={updateTokenValue}
                  />
                ))
              )}
            </>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Portfolio Total</TableCell>
            <TableCell className="text-right">
              {isLoading ? (
                <Skeleton className="ml-auto h-4 w-24" />
              ) : (
                `$${portfolioTotal.toFixed(2)}`
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
