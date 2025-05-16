import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const ConnectButton = () => {
  const { address } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-col items-center gap-y-2 py-4">
      {address ? (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              disconnect();
            }}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        connectors.map(connector => (
          <Button
            key={connector.uid}
            onClick={() => {
              connect({ connector });
            }}
          >
            Connect to {connector.name}
          </Button>
        ))
      )}
    </div>
  );
};
