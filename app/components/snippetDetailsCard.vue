<script setup lang="ts">
const props = defineProps<{
  class: string;
  title: string;
}>();
</script>

<template>
  <div
    :class="[
      'w-full m-2 lg:m-0 max-w-xs h-28 p-4 flex flex-col items-start justify-start relative overflow-hidden rounded-2xl',
      props.class,
    ]"
  >
    <p class="font-medium text-white/70">{{ title }}</p>
    <div class="flex flex-row space-x-2 mt-2">
      <slot />
    </div>

    <slot name="icon" />
  </div>
</template>
