<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSnippetCreationStore } from "~/stores/snippetCreationStore";

const snippetCreationStore = useSnippetCreationStore();
const { frameworks, snippetFramework } = storeToRefs(snippetCreationStore);
</script>

<template>
  <div class="flex flex-row space-x-4 w-fit rounded-full">
    <img
      v-for="framework in frameworks"
      :key="framework.name"
      :src="framework.icon"
      :alt="framework.name"
      :class="[
        'h-9 w-9 rounded-full cursor-pointer transition-all duration-300',
        snippetFramework == framework.name
          ? 'scale-105 cursor-pointer'
          : 'grayscale brightness-75',
      ]"
      @click="snippetFramework = framework.name"
    />
  </div>
</template>
