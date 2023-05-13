<script setup lang="ts">
import { useConnectWalletStore } from "./stores/connectWalletStore";
</script>

<template>
  <div class="relative">
    <lazy-wallet-dialog />
    <lazy-dialog />
    <appbar />
    <NuxtPage />
  </div>
</template>

<style lang="postcss">
html {
  @apply font-montserrat text-white bg-black;
  background: linear-gradient(150deg, #021215, #000000 76%) no-repeat;
  background-color: #000000;
  width: 100vw;
  min-height: 100vh;
}
</style>
