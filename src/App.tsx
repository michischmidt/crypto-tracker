import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartContainer from "./features/charts/components/ChartContainer";
import { WalletContainer } from "./features/wallet/components/WalletContainer";

enum AppTab {
  CHART = "chart",
  WALLET = "wallet",
}

export const App = () => (
  <div
    className="App flex w-full flex-col items-center overflow-y-scroll px-4 py-8"
    style={{ height: "100vh" }}
  >
    <h1 className="mb-8 scroll-m-20 text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
      <span className="bg-gradient-to-r from-[#15e6cd] to-[#037fff] bg-clip-text text-transparent">
        Mesh
      </span>{" "}
      - Crypto Tracker
    </h1>

    <div className="mx-auto w-full max-w-5xl">
      <Tabs defaultValue={AppTab.CHART} className="w-full">
        <TabsList className="mb-2 w-full justify-center">
          <TabsTrigger value={AppTab.CHART}>Chart</TabsTrigger>
          <TabsTrigger value={AppTab.WALLET}>Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value={AppTab.CHART}>
          <ChartContainer />
        </TabsContent>
        <TabsContent value={AppTab.WALLET}>
          <WalletContainer />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);
