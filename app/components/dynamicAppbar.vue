<script setup lang="ts">
import { useWallet } from "solana-wallets-vue";

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

const { status } = useAuthState();
const { connected } = useWallet();
</script>

<template>
  <div
    v-if="showAppbar"
    class="w-[calc(100vw-1.5rem)] mx-3 my-3 absolute top-0 left-0 flex flex-row justify-between items-center z-40"
  >
    <nuxt-link
      v-if="showLogo"
      to="/"
      :prefetch="true"
      class="ml-5 absolute top-4 flex flex-row items-center justify-center space-x-2 group"
    >
      <img
        src="@/assets/images/logo_transparent.png"
        alt=""
        class="w-[25px] group-hover:rotate-90 transition-all duration-1000"
      />
      <p class="text-xl font-medium">CAVYAR</p>
    </nuxt-link>

    <div
      class="lg:fixed top-3 right-3 ml-auto flex flex-row items-center justify-center space-x-2"
    >
      <a
        v-if="status === 'authenticated' && connected === true"
        href="/create"
        class="h-12 w-12 flex items-center justify-center bg-transparent backdrop-blur-2xl border border-white/5 hover:border-white/10 shadow-lg shadow-black/20 transition-all duration-500 rounded-3xl"
      >
        <icon name="line-md:plus" size="1.3em" />
      </a>
      <wallet-button />
    </div>
  </div>
</template>
