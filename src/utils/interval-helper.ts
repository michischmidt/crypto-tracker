import { TimePeriod } from "@/shared/types/intervals"

export const getTimePeriodDays = (period: TimePeriod): number => {
  switch (period) {
    case TimePeriod.WEEK:
      return 7
    case TimePeriod.MONTH:
      return 30
    case TimePeriod.YEAR:
      return 365
    default:
      return 7
  }
}
