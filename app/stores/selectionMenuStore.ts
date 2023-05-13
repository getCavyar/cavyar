import { acceptHMRUpdate } from "pinia";

export const useSelectionMenuStore = defineStore("selectionMenuStore", () => {
  const isOpen = useState("isOpen", () => false);
  const left = useState(() => "0px");
  const top = useState(() => "0px");

  return {
    isOpen,
    left,
    top,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useSelectionMenuStore, import.meta.hot)
  );
