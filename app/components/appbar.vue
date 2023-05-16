<script setup lang="ts">
const showAppbar = computed(() => {
  const { name } = useRoute();
  if (name === "index" || name === "snippets-id") {
    return true;
  }
  return false;
});
</script>

<template>
  <div
    v-if="showAppbar"
    class="rounded-full w-[calc(100vw-3rem)] mx-6 my-2 fixed top-0 left-0 flex flex-row justify-between items-center z-40"
  >
    <!-- <div
      class="p-6 w-fit h-[60px] flex items-center justify-center bg-surface/70 backdrop-blur-xl rounded-full"
    >
      <nuxt-link to="/" :prefetch="true">
        <img class="h-4" src="@/assets/images/logo.png" alt="Logo" />
      </nuxt-link>
    </div> -->
    <div
      class="ml-auto p-2 w-fit h-[60px] flex items-center justify-center bg-surface/70 backdrop-blur-xl rounded-full"
    >
      <!-- <div
        class="space-x-4 absolute top-1.5 right-2 flex flex-row items-center justify-center"
      > -->

      <wallet-button />
      <!-- </div> -->
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
