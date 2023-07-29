<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useConnectWalletStore } from "~/stores/connectWalletStore";
import { DialogType, useDialogStore } from "~~/stores/dialogStore";
import { useSnippetCreationStore } from "~~/stores/snippetCreationStore";
import { POSTSnippet } from "~~/ts/types";

const snippetCreationStore = useSnippetCreationStore();

const {
  monacoRef,
  snippetCode,
  mode,
  markerGroups,
  snippetDescription,
  snippetTitle,
  snippetFramework,
  snippetTags,
} = storeToRefs(snippetCreationStore);

const { openDialog } = useDialogStore();

const { showConnectWalletDialog } = storeToRefs(useConnectWalletStore());

const onFinished = async () => {
  try {
    if (monacoRef.value === null) {
      openDialog(DialogType.Error, "Internal error: Editor not initialized");
      return;
    }

    const markedSnippetCode = snippetCreationStore.getSnippetCode(
      snippetCode.value
    );
    console.log(markedSnippetCode);

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
        code: markedSnippetCode,
        tags: snippetTags.value,
        framework: snippetFramework.value,
      } as POSTSnippet),
    });

    if (data) {
      // @ts-ignore
      const id = data.value!.data.toString();
      await navigateTo(`/snippets/${id}`);

      // clear editor
      monacoRef.value.editor.getModels()[0].setValue("");
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

const containerRef = ref();

const stop = watchEffect(() => {
  if (monacoRef.value && containerRef.value) {
    nextTick(() => stop());
    monacoRef.value.editor.create(containerRef.value, {
      language: "typescript",
      theme: "vs-dark",
      fontSize: 20,
      readOnly: false,
    });
  }
  snippetCreationStore.initEditor();
});

onUnmounted(() => {
  if (monacoRef.value) {
    snippetCreationStore.unload();
  }
});
</script>

<template>
  <div>
    <lazy-selection-menu />

    <nuxt-layout name="create" @finished="onFinished">
      <div
        ref="containerRef"
        style="--vscode-editor-background: #000000; height: 400px"
      />
      <!-- <lazy-code-editor
        v-model="codeEditorValue"
        :read-only="mode == CreationMode.select"
      />  -->
    </nuxt-layout>
  </div>
</template>

<style></style>
