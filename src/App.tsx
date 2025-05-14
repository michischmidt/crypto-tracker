import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChartContainer from "./features/charts/components/ChartContainer"

enum AppTab {
  CHART = "chart",
  WALLET = "wallet",
}

export const App = () => (
  <div className="App flex flex-col items-center justify-center px-4 py-8 w-full">
    <h1 className="scroll-m-20 text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center">
      <span className="bg-gradient-to-r from-[#15e6cd] to-[#037fff] bg-clip-text text-transparent">
        Mesh
      </span>{" "}
      - Crypto Tracker
    </h1>

    <div className="w-full max-w-5xl mx-auto">
      <Tabs defaultValue={AppTab.CHART} className="w-full">
        <TabsList className="w-full justify-center mb-2">
          <TabsTrigger value={AppTab.CHART}>Chart</TabsTrigger>
          <TabsTrigger value={AppTab.WALLET}>Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value={AppTab.CHART}>
          <ChartContainer />
        </TabsContent>
        <TabsContent value={AppTab.WALLET}>
          <div className="p-4 text-center rounded-lg border">
            Metamask Wallet TBD.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
)
