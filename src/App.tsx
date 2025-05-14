import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChartContainer from "./features/charts/components/ChartContainer"

export const App = () => (
  <div className="App flex flex-col items-center justify-center px-4 py-8 w-full">
    <h1 className="scroll-m-20 text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center">
      Mesh Connect - Crypto Tracker
    </h1>

    <div className="w-full max-w-5xl mx-auto">
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="w-full justify-center mb-6">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          <ChartContainer />
        </TabsContent>
        <TabsContent value="wallet">
          <div className="p-4 text-center rounded-lg border">
            Metamask Wallet TBD.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
)
