import { useAccount, useBalance } from "wagmi";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo } from "react";
import { useGetTokenPriceQuery } from "@/features/marketData/marketDataApiSlice";

interface WalletAssetRowProps {
  contractAddress: string;
  chainId?: number;
  onValueChange: (address: string, value: number | null) => void;
}

export const WalletAssetRow = ({
  contractAddress,
  chainId,
  onValueChange,
}: WalletAssetRowProps) => {
  const { address } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    token: contractAddress as `0x${string}`,
  });
  const { data: priceData, isLoading: priceLoading } = useGetTokenPriceQuery({
    contractAddress,
    chainId,
  });

  const value = useMemo(() => {
    if (!balance || !priceData) return null;
    const numericBalance = parseFloat(balance.formatted);
    return numericBalance * priceData.usd;
  }, [balance, priceData]);

  useEffect(() => {
    onValueChange(contractAddress, value);
  }, [value, contractAddress, onValueChange]);

  const isLoading = balanceLoading ?? priceLoading;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {balanceLoading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          (balance?.symbol ?? "Unknown")
        )}
      </TableCell>
      <TableCell>
        {balanceLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : balance?.symbol ? (
          `${balance.symbol} Token`
        ) : (
          "Unknown Token"
        )}
      </TableCell>
      <TableCell className="text-right">
        {balanceLoading ? (
          <Skeleton className="ml-auto h-4 w-20" />
        ) : (
          (balance?.formatted ?? "0")
        )}
      </TableCell>
      <TableCell className="text-right">
        {priceLoading ? (
          <Skeleton className="ml-auto h-4 w-20" />
        ) : priceData ? (
          `$${priceData.usd.toFixed(2)}`
        ) : (
          "--"
        )}
      </TableCell>
      <TableCell className="text-right">
        {isLoading ? (
          <Skeleton className="ml-auto h-4 w-24" />
        ) : value ? (
          `$${value.toFixed(2)}`
        ) : (
          "--"
        )}
      </TableCell>
    </TableRow>
  );
};
