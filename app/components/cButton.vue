<script lang="ts" setup>
defineProps<{
  primary?: boolean;
  size: "lg" | "sm";
  icon?: string;
}>();

defineEmits(["click"]);
</script>

<template>
  <button
    :class="[
      'py-2.5 relative flex flex-row items-center justify-center rounded-lg bg-gradient-to-br from-surface via-surface/30 to-black font-medium text-white border border-white/10 group group-hover:bg-black transition-all duration-500',
      size == 'lg' ? 'w-full px-4' : 'px-8',
    ]"
    @click="$emit('click')"
  >
    <div className="group-active:opacity-0 transition-opacity duration-300">
      <slot />
      <icon
        v-if="icon"
        :name="icon"
        size="1.2em"
        class="ml-2 group-hover:ml-1 group-active:ml-1 transition-all duration-500 text-white"
      />
    </div>

    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-300"
    >
      <icon v-if="icon" :name="icon" size="1.2em" />
    </div>
  </button>
</template>
