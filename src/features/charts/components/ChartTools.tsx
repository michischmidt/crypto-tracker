import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { Coin } from "@/features/symbols/symbolsApiSlice"
import { useGetTopCoinsQuery } from "@/features/symbols/symbolsApiSlice"
import { ChevronsUpDown, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectSelectedId,
  setSelectedSymbol,
} from "@/features/symbols/symbolsSlice"
import type { TimePeriod } from "@/shared/types/intervals"

type ChartToolsProps = {
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

export const ChartTools = ({
  selectedPeriod,
  onPeriodChange,
}: ChartToolsProps) => {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const selectedId = useAppSelector(selectSelectedId)
  const { data: coins, isLoading } = useGetTopCoinsQuery(undefined)
  const selectedCoin = coins?.find(coin => coin.id === selectedId)

  const handleSymbolSelect = (coinId: string, coinSymbol: string) => {
    dispatch(setSelectedSymbol({ id: coinId, symbol: coinSymbol }))
    setOpen(false)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 md:pr-6 md:py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[160px] md:w-[180px] justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <>
                  {selectedCoin ? (
                    <div className="flex items-center">
                      {selectedCoin.image && (
                        <img
                          src={selectedCoin.image}
                          alt={selectedCoin.name}
                          className="size-4 mr-2"
                        />
                      )}
                      {selectedCoin.symbol}
                    </div>
                  ) : (
                    "Select Symbol..."
                  )}
                </>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search Symbols..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No symbol found.</CommandEmpty>
              <CommandGroup>
                {coins?.map((coin: Coin) => (
                  <CommandItem
                    key={coin.id}
                    value={coin.id}
                    onSelect={() => {
                      handleSymbolSelect(coin.id, coin.symbol)
                    }}
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedId === coin.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {coin.image && (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="size-4 mr-2"
                        />
                      )}
                      <span className="font-bold mr-2">{coin.symbol}</span>
                      <span className="text-muted-foreground text-sm truncate">
                        {coin.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <ToggleGroup
        type="single"
        className="md:ml-2"
        value={selectedPeriod}
        onValueChange={value => {
          if (value) onPeriodChange(value as TimePeriod)
        }}
      >
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
