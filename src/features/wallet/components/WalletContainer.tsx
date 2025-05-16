import { Card } from "@/components/ui/card";
import { ConnectButton } from "./ConnectButton";
import { WalletAssetsTable } from "./WalletAssetsTable";

export const WalletContainer = () => {
  return (
    <div>
      <ConnectButton />
      {/* i need to write only supported networks are eth mmain net and bnb  */}
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          Supported networks: Ethereum Mainnet, BNB Smart Chain.
        </p>
        <p className="text-muted-foreground text-sm">
          Developed (and tested) only with Meta Mask.
        </p>
      </div>
      <Card className="p-4">
        <WalletAssetsTable />
      </Card>
    </div>
  );
};
