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
    class="w-screen fixed top-0 left-0 flex flex-col z-40 shadow-lg shadow-black/40"
  >
    <div
      class="p-6 h-[66px] flex items-center justify-between bg-surface/70 backdrop-blur-xl"
    >
      <nuxt-link to="/" :prefetch="true">
        <img class="h-5" src="@/assets/images/logo.png" alt="Logo" />
      </nuxt-link>

      <div
        class="space-x-4 absolute top-2.5 right-6 flex flex-row items-center justify-center"
      >
        <wallet-button />
      </div>
    </div>
    <div class="bottom-gradient-border"></div>
  </div>
</template>

<style lang="postcss" scoped>
.bottom-gradient-border {
  @apply w-screen h-[0.3px];
  background: linear-gradient(
    200deg,
    rgb(var(--primary)),
    rgb(var(--secondary)),
    rgb(var(--primary)),
    rgb(var(--secondary))
  );
}
</style>
