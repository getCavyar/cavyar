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
  // mode,
  // markerGroups,
  snippetDescription,
  snippetTitle,
  snippetFramework,
  snippetTags,
  selectedSnippetFrameworkLanguage,
} = storeToRefs(snippetCreationStore);

const { openDialog } = useDialogStore();

const { showConnectWalletDialog } = storeToRefs(useConnectWalletStore());

const showLoadingScreen = useState("showLoadingScreen", () => false);

const onFinished = async () => {
  try {
    if (monacoRef.value === null) {
      openDialog(DialogType.Error, "Internal error: Editor not initialized");
      return;
    }

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
        ],
      );
      return;
    }

    showLoadingScreen.value = true;

    const { data } = await useFetch("/api/snippets", {
      method: "POST",
      body: JSON.stringify({
        creator: sessionData.value.user.name,
        title: snippetTitle.value,
        description: snippetDescription.value,
        code: snippetCode.value,
        tags: snippetTags.value,
        framework: snippetFramework.value,
      } as POSTSnippet),
    });

    if (data.value) {
      const id = data.value!.data.toString();
      showLoadingScreen.value = false;
      await navigateTo(`/snippets/${id}`);
    } else {
      openDialog(DialogType.Error, "Snippet creation failed");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    openDialog(DialogType.Error, "Snippet creation failed");
  }
  showLoadingScreen.value = false;
};

const containerRef = ref();

const stop = watchEffect(() => {
  if (monacoRef.value && containerRef.value) {
    nextTick(() => stop());

    const existingEditors = monacoRef.value.editor.getEditors();
    if (existingEditors.length > 0) {
      existingEditors[0].dispose();
    }
    monacoRef.value.editor.create(containerRef.value, {
      language: selectedSnippetFrameworkLanguage.value,
      theme: "vs-dark",
      fontSize: 20,
      readOnly: false,
      minimap: {
        enabled: false,
      },
    });
  }
  snippetCreationStore.initEditor();
});

onUnmounted(() => {
  snippetCreationStore.unload();
});
</script>

<template>
  <div class="relative">
    <Transition name="fade">
      <div
        v-if="showLoadingScreen"
        class="absolute top-0 left-0 z-20 w-screen h-screen flex justify-center items-center bg-black/30 backdrop-blur-md"
      >
        <p class="text-2xl font-medium animate-pulse">
          Generating AI description
          <span class="animate-bounce">...</span>
        </p>
      </div>
    </Transition>

    <!-- <lazy-selection-menu /> -->
    <nuxt-layout name="create" @finished="onFinished">
      <div ref="containerRef" class="monaco-editor-wrapper" />
    </nuxt-layout>
  </div>
</template>

<style>
.monaco-editor-wrapper {
  width: 100%;
  height: 60vh !important;
  max-height: 100% !important;
}

.monaco-editor .margin,
.monaco-editor,
.monaco-editor-background {
  background-color: #000000 !important;
}
</style>
