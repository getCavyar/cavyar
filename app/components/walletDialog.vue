<script setup lang="ts">
import { useWallet } from "solana-wallets-vue";
import { Wallet } from "solana-wallets-vue/dist/types";
import { storeToRefs } from "pinia";
import base58 from "bs58";
import { useConnectWalletStore } from "~~/stores/connectWalletStore";
import { SigninMessage } from "@/server/utils/signin_message";
import { DialogType, useDialogStore } from "~/stores/dialogStore";

const { openDialog } = useDialogStore();

const connectWalletStore = useConnectWalletStore();
const { showConnectWalletDialog } = storeToRefs(connectWalletStore);

const closeDialog = () => {
  connectWalletStore.showConnectWalletDialog = false;
};

const wallet = useWallet();
const { status, signIn, signOut, getCsrfToken, data: authData } = useAuth();

const handleSignIn = async () => {
  try {
    // if (!wallet.connected.value) {
    //   showConnectWalletDialog.value = true;
    // }

    const csrf = await getCsrfToken();
    if (!wallet.publicKey.value || !csrf || !wallet.signMessage.value) return;

    const message = new SigninMessage({
      domain: window.location.host,
      publicKey: wallet.publicKey.value.toString(),
      statement: `Sign this message to authenticate as ${wallet.publicKey.value
        .toString()
        .slice(0, 5)}...\n\n`,
      nonce: csrf,
    });

    const data = new TextEncoder().encode(message.prepare());
    const signature = await wallet.signMessage.value(data);
    const serializedSignature = base58.encode(signature);

    const res = await signIn("credentials", {
      message: JSON.stringify(message),
      redirect: false,
      signature: serializedSignature,
    });
    if (res?.error) {
      openDialog(DialogType.Error, `${res.error}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    openDialog(DialogType.Error, `${error}`);
  }
};

const onConnectWallet = async (wlt: Wallet) => {
  showConnectWalletDialog.value = false;
  wallet.select(wlt.adapter.name);
  await wallet.connect();

  if (!wallet.connected.value) {
    await wallet.connect();
  }

  handleSignIn();
};

onMounted(async () => {
  if (
    wallet.connected.value &&
    wallet.publicKey.value?.toString() !== authData.value?.user?.name
  ) {
    await handleSignIn();
  }
});

watch(
  () => wallet.connected.value,
  async (connected) => {
    if (
      wallet.publicKey.value &&
      authData.value &&
      wallet.publicKey.value?.toString() !== authData.value?.user?.name
    ) {
      await signOut();
    }
    if (!authData.value && wallet.publicKey.value) {
      await handleSignIn();
    }
    if (connected && status.value === "unauthenticated") {
      handleSignIn();
    }
    if (!connected && status.value === "authenticated") {
      console.log(authData.value);
      signOut();
    }
  }
);
</script>

<template>
  <div
    class="h-screen fixed left-1/2 -translate-x-1/2 z-50 flex justify-center items-center"
  >
    <!-- We need 2 seperate transitions here for cleaner animations -->
    <transition name="fade">
      <div
        v-if="showConnectWalletDialog"
        class="dialog-backdrop"
        @click="closeDialog"
      />
    </transition>
    <transition name="dialog">
      <div v-if="showConnectWalletDialog" class="dialog-border z-50 relative">
        <div
          class="w-[400px] p-4 pb-8 rounded-2xl border-primary bg-background"
        >
          <h3 class="text-white ml-1 mb-4 text-center font-semibold">
            Connect a Wallet
          </h3>
          <div class="flex flex-col items-center justify-center space-y-4">
            <button
              v-for="wlt in wallet.wallets.value"
              :key="wlt.adapter.name"
              class="w-full px-4 py-4 rounded-xl flex flex-row items-center justify-between bg-gradient-to-br from-surface/50 to-surface transition-all duration-500 hover:-translate-y-1 hover:scale-105 active:scale-100 active:translate-y-1"
              @click="onConnectWallet(wlt)"
            >
              <div class="flex flex-row items-center justify-center space-x-5">
                <img
                  :src="wlt.adapter.icon"
                  :alt="wlt.adapter.name"
                  class="w-8 h-8"
                />
                <p class="font-montserrat font-medium text-xl text-white/90">
                  {{ wlt.adapter.name }}
                </p>
              </div>
              <p class="font-montserrat font-light text-sm text-white/40">
                {{ wlt.readyState }}
              </p>
            </button>
          </div>
          <button class="close-button" @click="closeDialog">
            <icon name="uim:arrow-circle-down" size="2.8em" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="postcss" scoped>
.dialog-backdrop {
  @apply h-screen w-screen fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-black/20 backdrop-blur-lg;
}
.close-button {
  box-shadow: 0 0px 20px 5px #000000;
  background: linear-gradient(
    200deg,
    rgba(var(--primary), 0.8),
    rgb(var(--secondary))
  );
  @apply flex items-center justify-center absolute left-1/2 -translate-x-1/2 -bottom-6 bg-surface rounded-full text-black/50 transition-transform active:scale-90 hover:scale-110 duration-500;
}

.dialog-border {
  background: linear-gradient(
    200deg,
    rgba(var(--primary), 0.7),
    rgba(var(--secondary), 0.5),
    rgba(var(--primary), 0.5),
    rgba(var(--secondary), 0.7)
  );
  @apply p-0.5 rounded-[19px];
}
</style>
