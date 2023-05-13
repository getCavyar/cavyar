<script setup lang="ts">
const { data } = await useLazyAsyncData("snippets", () =>
  $fetch("/api/snippets")
);

const trendingSnippets = computed(() => {
  return data.value?.snippets.sort((a, b) => b.likes.length - a.likes.length);
});

const recentSnippets = computed(() => {
  return data.value?.snippets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});
</script>

<template>
  <nuxt-layout name="index">
    <template #trending>
      <lazy-snippet-card
        v-for="trendingSnippet in trendingSnippets"
        :key="trendingSnippet._id.toString()"
        :snippet="trendingSnippet"
      />
    </template>

    <template #recent>
      <lazy-snippet-card
        v-for="recentSnippet in recentSnippets"
        :key="recentSnippet._id.toString()"
        :snippet="recentSnippet"
      />
    </template>
  </nuxt-layout>
</template>
