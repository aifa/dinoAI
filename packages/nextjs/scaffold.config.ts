import { defineChain } from "viem";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
};

export const galadrielDevnet = defineChain({
  id: 696969,
  name: "Galadriel Dev",
  network: "galadriel",
  nativeCurrency: {
    decimals: 18,
    name: "GAL",
    symbol: "GAL",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.galadriel.com"],
    },
    public: {
      http: ["https://devnet.galadriel.com"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.galadriel.com" },
  },
});

const scaffoldConfig = {
  // The networks on which your DApp is live
  // Example of a custom chain configuration
  // This is useful for testing chains that are not yet supported by viem
  // You can find more information in the documentation:
  // https://viem.app/docs/scaffold/configuration#custom-chains
  //
  // const customChain: Chain = {
  //   chainId: 1234,
  //   chainName: "MyChain",
  //   rpcUrls: {
  //     default: "https://my-chain.com",
  //     goerli: "https://my-chain-goerli.com"
  //   },
  //   blockExplorerUrls: {
  //     default: "https://my-chain.com/blocks/{blockNumber}",
  //     goerli: "https://my-chain-goerli.com/blocks/{blockNumber}"
  //   },
  // };



  targetNetworks: [galadrielDevnet] as const,

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
