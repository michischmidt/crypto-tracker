import { Card } from "@/components/ui/card";
import { ConnectButton } from "./ConnectButton";
import { WalletAssetsTable } from "./WalletAssetsTable";

export const WalletContainer = () => {
  return (
    <div>
      <ConnectButton />
      <Card className="p-4">
        <WalletAssetsTable />
      </Card>
    </div>
  );
};
