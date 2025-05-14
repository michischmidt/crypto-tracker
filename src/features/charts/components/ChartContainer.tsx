import { Chart } from "./Chart";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectSelectedTimePeriod,
  setSelectedTimePeriod,
} from "@/features/marketData/marketDataSlice";
import type { TimePeriod } from "@/shared/types/intervals";

export default function ChartContainer() {
  const dispatch = useAppDispatch();
  const selectedPeriod = useAppSelector(selectSelectedTimePeriod);

  const handlePeriodChange = (period: TimePeriod) => {
    dispatch(setSelectedTimePeriod(period));
  };

  return (
    <div className="w-full">
      <Chart
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />
    </div>
  );
}
