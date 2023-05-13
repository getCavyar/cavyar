import SolanaWallets from "solana-wallets-vue";
import {
  BackpackWalletAdapter,
  BraveWalletAdapter,
  GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletStoreProps } from "solana-wallets-vue/dist/types";

const walletOptions = {
  wallets: [
    new BackpackWalletAdapter(),
    new GlowWalletAdapter(),
    new SolflareWalletAdapter(),
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    new LedgerWalletAdapter(),
  ],
  autoConnect: true,
} as WalletStoreProps;

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(SolanaWallets, walletOptions);
});
