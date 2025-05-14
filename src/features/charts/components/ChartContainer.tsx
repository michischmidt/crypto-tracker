import { useState } from "react"
import { Chart } from "./Chart"

export enum PeriodType {
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export default function ChartContainer() {
  const [selectedPeriod, setSelectedPeriod] = useState(PeriodType.WEEK)

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period)
  }

  return (
    <div className="w-full">
      <Chart
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />
    </div>
  )
}
