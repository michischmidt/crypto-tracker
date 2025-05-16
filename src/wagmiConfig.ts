import { http } from "viem";
import { createConfig } from "wagmi";
import { linea, lineaSepolia, mainnet, bsc } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  ssr: false, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [mainnet, linea, lineaSepolia, bsc],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
    [bsc.id]: http(),
  },
});
