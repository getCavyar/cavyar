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
