import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { connection } from "~~/ts/constants";

export const useConnectWalletStore = defineStore("connectWalletStore", () => {
  const showConnectWalletDialog = useSessionStorage(
    "showConnectWalletDialog",
    false
  );
  const showConnectedPopup = useSessionStorage("showConnectedPopup", false);

  return {
    showConnectWalletDialog,
    showConnectedPopup,
  };
});
