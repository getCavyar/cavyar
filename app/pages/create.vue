<script setup lang="ts">
import { Ace, Range } from "ace-builds";
import { storeToRefs } from "pinia";
import { useConnectWalletStore } from "~/stores/connectWalletStore";
import { DialogType, useDialogStore } from "~~/stores/dialogStore";
import {
  CreationMode,
  useSnippetCreationStore,
} from "~~/stores/snippetCreationStore";
import { POSTSnippet } from "~~/ts/types";

const {
  editor,
  codeEditorValue,
  mode,
  markers,
  markerGroups,
  snippetDescription,
  snippetTitle,
  snippetFramework,
  snippetTags,
} = storeToRefs(useSnippetCreationStore());

const getSnippetCode = (editor: Ace.Editor) => {
  const ranges = markers.value.map((marker) => {
    return new Range(
      marker.startRow,
      marker.startCol,
      marker.endRow,
      marker.endCol
    );
  });
  // Sort ranges by descending order of start position to simplify replacements
  ranges.sort((a, b) => {
    if (a === undefined || b === undefined) return 0;
    if (a?.start.row === b?.start.row) {
      return a.start.column - b.start.column;
    }
    return a.start.row - b.start.row;
  });
  // Replace each range with a numbered placeholder in reverse order to avoid changing earlier indices
  const code = useState(() => codeEditorValue.value);
  for (let i = ranges.length - 1; i >= 0; i--) {
    if (!ranges[i]) continue;
    const { start, end } = ranges[i]!;
    const startIndex = editor.session.doc.positionToIndex(start);
    const endIndex = editor.session.doc.positionToIndex(end);
    code.value = `${code.value.slice(0, startIndex)}\${${
      i +
      1 +
      ":" +
      markerGroups.value.filter((group) =>
        group.markers.some(
          (markerFromGroup) => markerFromGroup.id === markers.value[i].id
        )
      )[0].name
    }}${code.value.slice(endIndex)}`;
  }
  return code.value;
};

const { openDialog } = useDialogStore();

const { showConnectWalletDialog } = storeToRefs(useConnectWalletStore());

const onFinished = async () => {
  try {
    if (!editor.value) {
      openDialog(DialogType.Error, "Internal error: Editor not initialized");
      return;
    }
    const snippetCode = getSnippetCode(editor.value._editor);

    const { data: sessionData } = useAuth();

    if (!sessionData.value?.user?.name) {
      openDialog(
        DialogType.Error,
        "You must be logged in to create a snippet",
        [
          {
            label: "Sign in",
            callback: () => {
              showConnectWalletDialog.value = true;
            },
          },
        ]
      );
      return;
    }

    const { data } = await useFetch("/api/snippets", {
      method: "POST",
      body: JSON.stringify({
        creator: sessionData.value.user.name,
        title: snippetTitle.value,
        description: snippetDescription.value,
        code: snippetCode,
        tags: snippetTags.value,
        framework: snippetFramework.value,
      } as POSTSnippet),
    });

    if (data) {
      // @ts-ignore
      const id = data.value!.data.toString();
      await navigateTo(`/snippets/${id}`);

      // clear editor
      codeEditorValue.value = "";
      mode.value = 1;
      markerGroups.value = [];
      snippetDescription.value = "";
      snippetTitle.value = "";
      snippetFramework.value = "anchor";
      snippetTags.value = [];
    } else {
      openDialog(DialogType.Error, "Snippet creation failed");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    openDialog(DialogType.Error, "Snippet creation failed");
  }
};
</script>

<template>
  <div>
    <lazy-selection-menu />
    <nuxt-layout name="create" @finished="onFinished">
      <lazy-code-editor
        v-model="codeEditorValue"
        :read-only="mode == CreationMode.select"
      />
    </nuxt-layout>
  </div>
</template>
