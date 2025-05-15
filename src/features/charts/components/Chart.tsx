import { useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer as UIChartContainer } from "@/components/ui/chart";
import { ChartTools } from "./ChartTools";
import type { TimePeriod } from "@/shared/types/intervals";
import { useGetMarketDataQuery } from "@/features/marketData/marketDataApiSlice";
import { useAppSelector } from "@/app/hooks";
import {
  selectSelectedSymbol,
  selectSelectedId,
} from "@/features/symbols/symbolsSlice";
import { AlertOctagon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const chartConfig = {
  views: {
    label: "Price (USD)",
  },
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type ChartProps = {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
};

export const Chart = ({ selectedPeriod, onPeriodChange }: ChartProps) => {
  const selectedSymbol = useAppSelector(selectSelectedSymbol);
  const selectedId = useAppSelector(selectSelectedId);
  const {
    data: marketData,
    isLoading,
    error,
  } = useGetMarketDataQuery({
    coinId: selectedId,
    timePeriod: selectedPeriod,
  });

  useEffect(() => {
    if (error && typeof error === "object" && "status" in error) {
      const errorStatus = error.status as string;

      if (errorStatus === "RATE_LIMIT_ERROR") {
        toast.error("Too many requests", {
          description: (
            <span className="text-primary">
              API rate limit exceeded. Please try again later.
            </span>
          ),
          icon: <AlertOctagon className="text-destructive" />,
          duration: 5000,
        });
      }
    }
  }, [error]);

  const formattedData =
    marketData?.map(item => ({
      date: item.date.split("T")[0], // Just the date part of ISO string
      price: item.price,
    })) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b p-0 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle>{selectedSymbol} Price Chart</CardTitle>
          <CardDescription>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}{" "}
            performance data from CoinGecko
          </CardDescription>
        </div>
        <ChartTools
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
        />
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="text-primary size-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-destructive flex h-[400px] items-center justify-center">
            Error loading market data. Please try again later or different
            symbol.
          </div>
        ) : formattedData.length === 0 ? (
          <div className="text-muted-foreground flex h-[400px] items-center justify-center">
            No market data available for {selectedSymbol}.
          </div>
        ) : (
          <UIChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                  }
                  domain={[
                    (dataMin: number) => dataMin * 0.95,
                    (dataMax: number) => dataMax * 1.05,
                  ]} // adds padding to min and max
                  tickCount={10}
                  allowDecimals={true}
                  scale="linear"
                  width={90}
                  interval={0}
                  minTickGap={10}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
                    "Price",
                  ]}
                  labelFormatter={(label: string) => {
                    const date = new Date(label);
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff" }}
                  isAnimationActive={true}
                  animationDuration={750}
                />
              </LineChart>
            </ResponsiveContainer>
          </UIChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
