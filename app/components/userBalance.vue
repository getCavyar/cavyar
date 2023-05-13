<script setup lang="ts">
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
import { connection } from "~~/ts/constants";

const { publicKey } = useWallet();

const balance = ref();
balance.value = await connection.getBalance(publicKey.value!);
</script>

<template>
  <p>
    {{ (balance / LAMPORTS_PER_SOL).toFixed(2) }}
  </p>
</template>
