<script setup lang="ts">
const showAppbar = computed(() => {
  const { name } = useRoute();
  if (name === "create") {
    return false;
  }
  return true;
});

const showLogo = computed(() => {
  const { name } = useRoute();
  if (name === "index") {
    return false;
  }
  return true;
});
</script>

<template>
  <div
    v-if="showAppbar"
    class="w-[calc(100vw-1.5rem)] mx-3 my-3 fixed top-0 left-0 flex flex-row justify-between items-center z-40"
  >
    <nuxt-link
      v-if="showLogo"
      to="/"
      :prefetch="true"
      class="ml-5 absolute top-4"
    >
      <img src="@/assets/images/logo.png" alt="" class="h-[18px]" />
    </nuxt-link>

    <div class="ml-auto flex flex-row items-center justify-center space-x-2">
      <nuxt-link
        to="/create"
        :prefetch="true"
        class="h-12 w-12 flex items-center justify-center bg-transparent backdrop-blur-2xl border border-white/5 shadow-lg shadow-black/20 transition-all duration-500 rounded-3xl"
      >
        <icon name="line-md:plus" size="1.3em" />
      </nuxt-link>
      <wallet-button />
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
