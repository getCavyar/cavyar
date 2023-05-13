<script setup lang="ts">
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { storeToRefs } from "pinia";
import { useWallet } from "solana-wallets-vue";
import { useConnectWalletStore } from "~~/stores/connectWalletStore";
import { connection } from "~~/ts/constants";

const { connected, publicKey, disconnecting, wallet, disconnect } = useWallet();

const connectWalletStore = useConnectWalletStore();
const { showConnectWalletDialog, showConnectedPopup } =
  storeToRefs(connectWalletStore);

const openWalletDialog = () => {
  if (!connected.value) showConnectWalletDialog.value = true;
  if (connected.value) showConnectedPopup.value = !showConnectedPopup.value;
};

// when user connects wallet, fetch balance
const balance = ref(0);
const fetchBalance = async () => {
  if (connected.value && publicKey.value) {
    const balanceLamports = await connection.getBalance(publicKey.value);
    balance.value = balanceLamports / LAMPORTS_PER_SOL;
  }
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="showConnectedPopup"
      @click="showConnectedPopup = false"
      class="w-screen h-screen absolute -right-6 -top-2 bg-black/50 backdrop-blur-xl"
    />
  </transition>
  <button
    @click="openWalletDialog"
    :class="[
      'wallet-button',
      showConnectedPopup
        ? 'pointer-events-none h-[205px] border-transition'
        : 'h-12 border-transition-reverse',
    ]"
  >
    <!-- Always Visible when connected -->
    <div
      v-if="connected && publicKey"
      class="flex flex-row items-center justify-center space-x-2 px-6"
    >
      <img :src="wallet?.adapter.icon" alt="Icon" class="h-[18px] w-[18px]" />
      <p>{{ publicKey.toString().slice(0, 4) }}</p>

      <div>
        <div class="mx-2 h-6 w-[1.5px] bg-white/10" />
      </div>

      <div class="flex flex-row items-center justify-center space-x-2">
        <icon
          class="text-primary/80"
          name="mingcute:solana-sol-fill"
          size="1.2em"
        />
        <Suspense>
          <UserBalance />
          <template #fallback> ... </template>
        </Suspense>
      </div>
    </div>
    <div
      v-else
      class="flex flex-row items-center justify-center space-x-2 px-6"
    >
      <icon name="ion:wallet-outline" size="1.3em" class="text-primary" />
      <p>Connect Wallet</p>
    </div>

    <!-- Visible when button pressed -->
    <transition name="dialog-delayed">
      <div
        v-if="showConnectedPopup"
        class="w-full pointer-events-auto absolute top-12 px-3"
      >
        <nuxt-link
          to="/me"
          class="w-full h-10 pl-3 relative flex flex-row space-x-3 items-center justify-start rounded-lg bg-gray-500/5"
        >
          <icon name="ri:user-smile-fill" size="1.3em" class="text-primary" />
          <p>Profile</p>
        </nuxt-link>
        <button
          @click="() => (showConnectWalletDialog = true)"
          :disabled="!connected || disconnecting"
          class="w-full h-10 pl-3 my-2.5 relative flex flex-row space-x-3 items-center justify-start rounded-lg bg-gray-500/5"
        >
          <icon name="ion:wallet-outline" size="1.3em" class="text-primary" />
          <p>Change Wallet</p>
        </button>
        <button
          @click="disconnect"
          :disabled="!connected || disconnecting"
          class="w-full h-10 pl-3 relative flex flex-row space-x-3 items-center justify-start rounded-lg bg-gray-500/5"
        >
          <icon
            name="fluent:plug-disconnected-24-regular"
            size="1.3em"
            class="text-primary"
          />
          <p>Disconnect</p>
        </button>
      </div>
    </transition>
  </button>
</template>

<style lang="postcss" scoped>
.wallet-button {
  @apply p-0.5 pt-2.5 relative flex items-start justify-center bg-surface border border-white/5 transition-all duration-500;
}

.border-transition {
  animation: border-transition 0.4s ease forwards;
}

@keyframes border-transition {
  0% {
    border-radius: 80px;
  }
  100% {
    border-radius: 15px;
  }
}

.border-transition-reverse {
  animation: border-transition-reverse 0.4s ease forwards;
}

@keyframes border-transition-reverse {
  0% {
    border-radius: 15px;
  }
  100% {
    border-radius: 80px;
  }
}
</style>
