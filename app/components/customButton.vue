<script setup lang="ts">
const props = defineProps<{
  primary: boolean;
  disabled: boolean;
}>();

const classes = computed(() => {
  return props.primary ? "primary-button" : "secondary-button";
});

const emit = defineEmits<{
  (event: "click", ...args: any[]): void;
}>();
const onClick = () => {
  emit("click");
};
</script>

<template>
  <button :class="classes" :disabled="disabled" @click="onClick">
    <slot />
  </button>
</template>

<style lang="postcss" scoped>
.primary-button {
  @apply bg-primary/80 rounded-lg px-5 h-[42px] text-base text-black font-montserrat font-semibold shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 hover:scale-105 active:scale-100 active:translate-y-1;
}

.secondary-button {
  @apply bg-black border-[1.5px] border-white/10 rounded-lg px-5 h-[42px] text-base text-white/90 font-montserrat font-semibold shadow-xl hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1 hover:scale-105 active:scale-100 active:translate-y-1;
}
</style>
