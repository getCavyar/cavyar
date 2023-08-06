import { acceptHMRUpdate } from "pinia";

export enum DialogType {
  Warning = "Warning",
  Error = "Error",
  Info = "Info",
  Tip = "Tip The Creator",
}

export type DialogAction = {
  label: string;
  callback: () => void;
};

export const useDialogStore = defineStore("dialogStore", () => {
  const showDialog = useState<boolean>("showDialog", () => false);
  const dialogType = useState<DialogType>("dialogType", () => DialogType.Info);
  const dialogContent = useState<string>("dialogContent", () => "");
  const dialogActions = useState<DialogAction[]>("actions", () => []);

  const openDialog = (
    type: DialogType,
    content: string,
    actions: DialogAction[] = [
      {
        label: "OK",
        callback: () => {
          closeDialog();
        },
      },
    ],
  ) => {
    dialogType.value = type;
    dialogContent.value = content;
    showDialog.value = true;
    dialogActions.value = actions.map((action) => ({
      ...action,
      callback:
        action.callback === closeDialog
          ? action.callback
          : () => {
              action.callback();
              closeDialog();
            },
    }));
  };

  const closeDialog = () => {
    showDialog.value = false;
  };

  return {
    showDialog,
    dialogType,
    dialogContent,
    dialogActions,
    openDialog,
    closeDialog,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDialogStore, import.meta.hot));
