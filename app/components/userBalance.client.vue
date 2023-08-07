<script setup lang="ts">
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";

const { publicKey } = useWallet();

const { data: balance } = await useAsyncData(
  async () => {
    if (!publicKey.value) return;
    return await $fetch(`/api/users/${publicKey.value.toString()}/balance`);
  },
  {
    transform: (value) => {
      if (!value) return 0;
      return value.data;
    },
  },
);
</script>

<template>
  <p>
    {{ (balance / LAMPORTS_PER_SOL).toFixed(2) }}
  </p>
</template>
