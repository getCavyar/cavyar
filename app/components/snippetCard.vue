<script setup lang="ts">
import { getAvatar, shortenPublicKey } from "~/ts/utils";
import { Snippet } from "~~/ts/types";
// import { generateAvatar } from "~~/ts/utils";

defineProps<{
  snippet: Snippet;
}>();
</script>

<template>
  <nuxt-link class="snippet-card" :to="`/snippets/${snippet._id.toString()}`">
    <p class="text-xl font-medium text-white/90 line-clamp-2">
      {{ snippet.title }}
    </p>
    <p class="text-sm text-white/80 line-clamp-2">
      {{ snippet.description }}
    </p>
    <div class="flex flex-wrap items-start justify-start">
      <p
        v-for="tag in snippet.tags"
        :key="tag"
        class="px-2 py-1 mt-1.5 mr-1.5 bg-white/5 rounded-md text-sm border border-white/10 h-8 w-max"
      >
        {{ tag }}
      </p>
    </div>
    <div class="w-full flex flex-row justify-between items-center">
      <div class="w-full flex flex-row items-center space-x-2">
        <img
          class="h-5 w-5 rounded-full"
          :src="getAvatar(snippet.creator)"
          alt=""
        />
        <p class="text-sm text-white/80">
          {{ shortenPublicKey(snippet.creator) }}
        </p>
      </div>
      <div
        class="w-full flex flex-row items-center justify-end space-x-2 text-white/80"
      >
        <icon name="ph:heart-straight" size="1.4em" class="text-red-800/80" />
        <p class="text-base">{{ snippet.likes.length }}</p>
      </div>
    </div>
  </nuxt-link>
</template>

<style lang="postcss" scoped>
.snippet-card {
  background: linear-gradient(140deg, #0c0c0c, #000000);
  @apply h-[230px] min-w-[380px] w-[380px] px-5 py-4 space-y-2 flex flex-col justify-between items-start rounded-3xl border-[1.5px] border-white/10 cursor-pointer transition-all duration-300;
}
.snippet-card:hover {
  @apply border-primary/70;
}
</style>
