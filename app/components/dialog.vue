<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useDialogStore, DialogType } from "~~/stores/dialogStore";

const dialogStore = useDialogStore();
const { showDialog, dialogContent, dialogType, dialogActions } =
  storeToRefs(dialogStore);

const icon = computed(() => {
  switch (dialogType.value) {
    case DialogType.Error:
      return "line-md:alert-circle-twotone";
    case DialogType.Info:
      return "";
    case DialogType.Warning:
      return "line-md:alert";
    default:
      return "";
  }
});
</script>

<template>
  <div
    class="h-screen fixed left-1/2 -translate-x-1/2 z-50 flex justify-center items-center"
  >
    <!-- We need 2 seperate transitions here for cleaner animations -->
    <transition name="fade">
      <div
        v-if="showDialog"
        class="dialog-backdrop"
        @click="dialogStore.closeDialog()"
      />
    </transition>
    <transition name="dialog">
      <div v-if="showDialog" class="dialog-border z-50 relative">
        <!-- TODO -->
        <!-- <icon
          name="line-md:alert"
          size="3em"
          class="z-[10] top-0 left-0 text-white"
        /> -->
        <div
          class="w-[400px] p-4 pb-[85px] rounded-2xl border-primary bg-background"
        >
          <h3 class="text-white ml-1 mb-5 text-center font-semibold">
            {{ dialogType }}
          </h3>
          <p class="text-lg text-center">{{ dialogContent }}</p>
        </div>
        <div
          class="w-[90%] absolute bottom-5 left-[5%] flex flex-row space-x-3"
        >
          <button
            v-for="action in dialogActions"
            :key="action.label"
            @click="action.callback"
            class="w-full py-2 font-medium border-[1.5px] border-white/10 rounded-2xl active:scale-95 hover:scale-[1.03] duration-500 hover:text-primary"
          >
            {{ action.label }}
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
