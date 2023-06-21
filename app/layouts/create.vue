<script setup lang="ts">
import { storeToRefs } from "pinia";
import { v4 as idv4 } from "uuid";
import { format } from "prettier";
import parserTypeScript from "prettier/parser-typescript";
import * as rustPlugin from "prettier-plugin-rust";
import { DialogType, useDialogStore } from "~~/stores/dialogStore";
import {
  CreationMode,
  useSnippetCreationStore,
} from "~~/stores/snippetCreationStore";

const emit = defineEmits(["finished"]);

const { openDialog } = useDialogStore();

const snippetCreationStore = useSnippetCreationStore();
const {
  codeEditorValue,
  mode,
  selectedMarkerGroup,
  markerGroups,
  snippetTitle,
  snippetDescription,
  snippetTags,
  tagInput,
  selectedSnippetFrameworkLanguage,
} = storeToRefs(snippetCreationStore);

const formatCode = () => {
  try {
    if (selectedSnippetFrameworkLanguage.value === "typescript") {
      codeEditorValue.value = format(codeEditorValue.value, {
        parser: "typescript",
        plugins: [parserTypeScript],
        tabWidth: 4,
      });
      return;
    }
    if (selectedSnippetFrameworkLanguage.value === "python") {
      // TODO: Find a python formatter.
      openDialog(
        DialogType.Error,
        "Formatting is currently not supported for Python.",
        [
          {
            label: "Ok",
            callback() {},
          },
        ]
      );
      return;
    }
    if (selectedSnippetFrameworkLanguage.value === "rust") {
      codeEditorValue.value = format(codeEditorValue.value, {
        parser: "jinx-rust",
        plugins: [rustPlugin],
        tabWidth: 4,
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Prettier Error", e);
    openDialog(DialogType.Error, `${e}`, [
      {
        label: "Ok",
        callback() {},
      },
    ]);
  }
};

const createMarkerGroup = () => {
  // Check if last marker group was used
  if (
    markerGroups.value.length > 0 &&
    markerGroups.value[markerGroups.value.length - 1].markers.length === 0
  ) {
    openDialog(
      DialogType.Error,
      "You already have an empty marker group. Please use it first before creating a new one.",
      [
        {
          callback() {},
          label: "Ok",
        },
      ]
    );
    return;
  }

  const id = `marker-${idv4()}`;
  const markerGroupColor = snippetCreationStore.getRandomColor();

  markerGroups.value.push({
    id,
    color: markerGroupColor,
    name: "",
    markers: [],
  });

  selectedMarkerGroup.value = id;

  snippetCreationStore.createMarkerGroupClass(id);
};

const codeEditorRef = ref<HTMLElement | null>(null);

const animateNext = () => {
  const codeEditorEl = codeEditorRef.value;
  if (!codeEditorEl) return;

  codeEditorEl.classList.add("animate-next");
  setTimeout(() => {
    codeEditorEl.classList.remove("animate-next");
  }, 800);
};

const animatePrevious = () => {
  const codeEditorEl = codeEditorRef.value;
  if (!codeEditorEl) return;

  codeEditorEl.classList.add("animate-previous");
  setTimeout(() => {
    codeEditorEl.classList.remove("animate-previous");
  }, 800);
};

const onNext = () => {
  if (mode.value === CreationMode.edit) {
    if (markerGroups.value.length === 0) {
      createMarkerGroup();
    }
  }
  if (mode.value === CreationMode.details) {
    emit("finished");
    return;
  }
  animateNext();
  mode.value++;
};

const onPrevious = () => {
  if (mode.value === CreationMode.edit) return;
  if (mode.value === CreationMode.select && markerGroups.value.length > 0) {
    openDialog(
      DialogType.Warning,
      "If you go back, you will lose all your markers. Are you sure you want to go back?",
      [
        {
          callback() {},
          label: "Cancel",
        },
        {
          callback() {
            snippetCreationStore.deleteAllMarkers();

            animatePrevious();
            mode.value--;
          },
          label: "Yes",
        },
      ]
    );
    return;
  }
  animatePrevious();
  mode.value--;
};

const nextButtonDisabled = computed(() => {
  if (codeEditorValue.value.length <= 3) return true;
});

const previousButtonDisabled = computed(() => {
  if (mode.value === 1) return true;
  return false;
});
</script>

<template>
  <div
    class="w-screen h-screen relative space-y-5 flex flex-col items-center justify-center"
  >
    <nuxt-link
      to="/"
      class="absolute left-6 top-6 flex flex-row items-center justify-between space-x-2 text-white/70 font-medium"
    >
      <icon name="mingcute:exit-line" size="2em" class="rotate-180" />
      <p>Exit</p>
    </nuxt-link>

    <!-- Title/Header -->
    <div class="flex flex-col items-center justify-center">
      <div class="relative">
        <div class="title-glow" />
        <h1 class="gradient-text">
          {{
            mode == CreationMode.edit
              ? "Enter Your Code"
              : mode == CreationMode.select
              ? "Mark Variables"
              : "Details"
          }}
        </h1>
        <div class="flex flex-row space-x-2 items-center justify-center">
          <div
            v-for="i in 3"
            :key="i"
            :class="[
              'w-4 h-4 border rounded-full bg-primary border-primary',
              i == mode
                ? 'border-opacity-100 bg-opacity-100'
                : 'border-opacity-30 bg-opacity-5',
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Body -->
    <div ref="codeEditorRef">
      <div
        v-show="mode != CreationMode.details"
        class="snippet-container-border"
      >
        <div class="snippet-container p-4">
          <div class="w-full h-full relative">
            <slot />
          </div>
        </div>
      </div>

      <div v-if="mode == CreationMode.details" class="">
        <div class="w-full h-full relative">
          <div class="snippet-container-border">
            <!-- <slot name="frameworks+tags" />
            <slot name="title" />
            <slot name="description" /> -->

            <div
              class="snippet-container flex flex-col items-center justify-center"
            >
              <div class="w-[80%] space-y-8">
                <div class="space-y-3 text-white/60 font-medium">
                  <p>Snippet Title</p>
                  <input
                    v-model="snippetTitle"
                    class="details-input"
                    placeholder="Send Transaction..."
                  />
                </div>

                <div class="space-y-3 text-white/60 font-medium">
                  <p>Snippet Description</p>

                  <textarea
                    v-model="snippetDescription"
                    class="details-input min-h-[42px] max-h-32"
                    type="text"
                    placeholder="You can simply substract the lamports you want to transfer from the sender's balance and add it to the receiver's balance..."
                  />
                </div>

                <div class="space-y-3 text-white/60 font-medium">
                  <p>Snippet Framework / Language</p>
                  <framework-selector />
                </div>

                <div class="space-y-3 text-white/60 font-medium">
                  <p>Keywords that describe your snippet</p>
                  <div class="flex flex-wrap items-center justify-start">
                    <form
                      class="flex flex-row items-center justify-start space-x-2 mr-4 mb-2"
                      @submit="snippetCreationStore.addTag(tagInput)"
                    >
                      <input
                        v-model="tagInput"
                        class="text-white text-sm bg-primary/10 w-40 p-2 rounded-md text-center"
                        placeholder="Add Tag..."
                      />
                      <button
                        class="text-white text-sm bg-primary/10 w-10 p-2 rounded-md"
                        @click="snippetCreationStore.addTag(tagInput)"
                        @click.prevent
                      >
                        <icon
                          name="line-md:plus"
                          size="20px"
                          class="text-white/70"
                        />
                      </button>
                    </form>

                    <div
                      v-for="tag in snippetTags"
                      :key="tag"
                      class="flex flex-row items-center justify-center text-white text-sm bg-white/5 p-2 px-3 rounded-md text-center mr-2 mb-2 space-x-2"
                    >
                      <p>{{ tag }}</p>
                      <button
                        class="pb-0.5"
                        @click="snippetCreationStore.deleteTag(tag)"
                      >
                        <icon
                          name="line-md:close"
                          size="15px"
                          class="text-white/70"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="w-[1000px] h-16 relative">
      <!-- Code Editing Info -->
      <transition name="blur-left">
        <div
          v-if="mode == CreationMode.edit"
          class="h-[55px] gradient-border p-0.5 absolute left-0 flex flex-row space-x-0.5 text-white/80"
        >
          <div
            class="bg-background flex flex-row items-center rounded-l-xl rounded-r-sm p-2 px-4 space-x-2"
          >
            <icon name="clarity:code-line" size="2em" />
            <p class="text-lg min-w-[30px]">{{ codeEditorValue.length }}</p>
          </div>
          <div
            class="bg-background flex flex-row items-center rounded-sm p-2 px-4 space-x-2"
          >
            <icon name="system-uicons:paragraph-left" size="2em" />
            <p class="text-lg">{{ codeEditorValue.split("\n").length }}</p>
          </div>

          <div
            class="bg-background flex flex-row items-center rounded-sm p-2 px-4 space-x-2"
          >
            <icon name="clarity:bolt-line" size="1.35em" />
            <button
              class="text-lg hover:text-primary active:text-primary/50 transition-all duration-300"
              @click="formatCode"
            >
              Format
            </button>
          </div>

          <div
            class="bg-background flex flex-row items-center rounded-l-sm rounded-r-xl p-2 px-4 space-x-2"
          >
            <div class="scale-90">
              <framework-selector />
            </div>
          </div>
        </div>
      </transition>

      <!-- Marker Groups -->
      <transition name="blur-left">
        <div
          v-if="mode == CreationMode.select"
          class="absolute left-0 gradient-border max-w-2xl p-0.5"
        >
          <div
            class="h-[55px] flex flex-row items-center rounded-xl space-x-0.5 overflow-x-hidden"
          >
            <div
              :class="[
                'h-[55px] w-fit  bg-background flex flex-row items-center rounded-l-xl p-2 px-6 space-x-2',
                markerGroups.length > 0 ? 'rounded-r-sm' : 'rounded-r-xl',
              ]"
            >
              <button
                :disabled="false"
                :class="[
                  'transition-all duration-300 whitespace-nowrap',
                  previousButtonDisabled
                    ? 'opacity-30'
                    : 'hover:text-primary active:text-primary/50',
                ]"
                @click="createMarkerGroup"
              >
                Add Marker
              </button>
              <button
                :disabled="false"
                :class="[
                  'transition-all duration-300 whitespace-nowrap',
                  previousButtonDisabled
                    ? 'opacity-30'
                    : 'hover:text-primary active:text-primary/50',
                ]"
                @click="createMarkerGroup"
              >
                Add Marker
              </button>
            </div>

            <div
              v-if="markerGroups.length > 0"
              :class="[
                'flex flex-row items-start justify-start space-x-3 bg-background rounded-l-sm rounded-r-xl py-2 pl-1 pr-3 w-max overflow-x-auto',
                { 'ml-4': markerGroups.length > 0 },
              ]"
            >
              <div class="flex flex-row items-center space-x-2 pl-2">
                <button
                  v-for="(markerGroup, index) in markerGroups"
                  :key="index"
                  :class="[
                    'rounded-md text-white/80 h-10 w-40 transition-all',
                    { 'scale-105': markerGroup.id === selectedMarkerGroup },
                    {
                      'brightness-[0.3]':
                        markerGroup.id !== selectedMarkerGroup,
                    },
                  ]"
                  :style="`background: linear-gradient(130deg, ${markerGroup.color}05, ${markerGroup.color}10); border: 1.5px solid ${markerGroup.color}60`"
                  @click="selectedMarkerGroup = markerGroup.id"
                  @focus="selectedMarkerGroup = markerGroup.id"
                >
                  <input
                    v-model="markerGroup.name"
                    class="bg-transparent text-white/80 placeholder:text-white/40 text-center w-full h-full"
                    type="text"
                    placeholder="Group Name"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <div
        class="h-[55px] gradient-border p-0.5 flex flex-row space-x-0.5 absolute right-0 top-0 font-medium"
      >
        <div
          class="bg-background flex flex-row items-center rounded-l-xl rounded-r-sm p-2 px-6 space-x-2"
        >
          <button
            :disabled="previousButtonDisabled"
            :class="[
              'transition-all duration-300',
              previousButtonDisabled
                ? 'opacity-30'
                : 'hover:text-primary active:text-primary/50',
            ]"
            @click="onPrevious"
          >
            Previous
          </button>
        </div>

        <div
          class="bg-background flex flex-row items-center rounded-r-xl rounded-l-sm p-2 px-6 space-x-2"
        >
          <button
            :disabled="nextButtonDisabled"
            :class="[
              'transition-all duration-300',
              nextButtonDisabled
                ? 'opacity-30'
                : 'hover:text-primary active:text-primary/50',
            ]"
            @click="onNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.title-glow {
  @apply absolute blur-xl w-full h-[80px] rounded-full opacity-20;
  background: linear-gradient(
    90deg,
    rgba(var(--primary), 0.8),
    rgba(var(--primary), 0.2)
  );
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.gradient-text {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70;
}

.gradient-border {
  background: linear-gradient(
    200deg,
    rgba(var(--primary), 0.7),
    rgba(var(--secondary), 0.5),
    rgba(var(--primary), 0.5),
    rgba(var(--secondary), 0.7)
  );
  @apply rounded-2xl;
}

.snippet-container-border {
  background: linear-gradient(
    200deg,
    rgba(var(--primary), 0.7),
    rgba(var(--secondary), 0.5),
    rgba(var(--primary), 0.5),
    rgba(var(--secondary), 0.7)
  );
  @apply p-0.5 rounded-2xl;
}

.snippet-container {
  @apply rounded-xl w-[1000px] h-[550px] backdrop-blur-2xl bg-background;
  /* background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.5) 100%
  ); */
  /* linear-gradient(180deg, #000000 0%, #111111 100%); */
}

.selection-button-group {
  @apply flex flex-row items-center justify-start rounded-b-xl space-x-2 h-14 px-2 fixed bottom-0 left-0 z-10 border-t-2;
  background: linear-gradient(180deg, #0000008c 0%, #1111119b 100%);
  backdrop-filter: blur(20px);
  border-color: #4f00a2;
}

.selected-marker-group {
  @apply scale-105 bg-[#7b00ff20] border-[#7b00ff];
  box-shadow: 0 0 10px #000000;
}

.selection-button-group button {
  @apply w-10 h-10 text-sm transition-all duration-200 rounded-lg border border-transparent;
}

.selection-button-group button:nth-child(1) {
  @apply rounded-t-[14px];
}

.selection-button-group button:last-child {
  @apply rounded-b-[14px];
}

.details-input {
  @apply text-white placeholder:text-white/40 w-full bg-transparent border-[1.5px] border-white/10 focus:border-secondary p-2 px-4 rounded-md text-start transition-colors duration-500;
}

.animate-next {
  animation: next 0.8s ease;
}

@keyframes next {
  0% {
    opacity: 0;
    transform: translateX(0);
  }

  50% {
    filter: blur(20px);
    transform: translateX(-130%);
  }

  51% {
    transform: translateX(100%);
  }

  100% {
    opacity: 1;
    filter: blur(0px);
    transform: translateX(0);
  }
}

.animate-previous {
  animation: previous 0.8s ease;
}

@keyframes previous {
  0% {
    opacity: 0;
    transform: translateX(0);
  }

  50% {
    filter: blur(20px);
    transform: translateX(130%);
  }

  51% {
    transform: translateX(-100%);
  }

  100% {
    opacity: 1;
    filter: blur(0px);
    transform: translateX(0);
  }
}
</style>
