<script setup lang="ts">
import { PropType } from "vue";
import { Snippet } from "../../ts/types";

defineProps({
  search: {
    type: Object as PropType<{
      focused: boolean;
      query: string;
      results: Snippet[];
    }>,
    required: true,
  },
  isFetching: {
    type: Boolean,
    required: true,
  },
  querySnippets: {
    type: Function as PropType<(query: string) => void>,
    required: true,
  },
});
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div
    class="w-[calc(100%-30px)] sm:w-[calc(100%-100px)] md:w-[calc(100%-200px)] lg:max-w-3xl h-16 relative flex items-center justify-center group-scoped transition-all"
  >
    <input
      v-model="search.query"
      :class="[
        'w-full h-full pl-16 py-1 px-4 text-white text-lg font-medium group-scoped-focus-within:w-[calc(100%-50px)] focus:bg-background/70 placeholder:text-white/40 backdrop-blur-2xl rounded-xl shadow-lg shadow-black/20 border hover:border-primary focus:border-primary transition-all duration-500',
        search.focused
          ? 'bg-background border-primary'
          : 'bg-black/40 border-transparent',
      ]"
      placeholder="PDA Signer Anchor..."
      @input="
        () => {
          querySnippets(search.query);
        }
      "
      @click="
        (e) => {
          search.focused = true;
          e.stopPropagation();
        }
      "
    />
    <icon
      name="line-md:search"
      size="1.4em"
      class="mb-0.5 absolute left-5 group-scoped-focus-within:left-12 text-[#5A6060] group-scoped-focus-within:text-primary group-scoped-hover:text-primary transition-all duration-500"
    />
    <p
      v-if="search.results?.length > 0"
      class="mb-0.5 absolute right-5 text-[#5A6060] transition-all duration-500"
    >
      {{ search.results.length }} Results
    </p>

    <slot />
  </div>
</template>
