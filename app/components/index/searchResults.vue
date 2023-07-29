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
});

const getSpanWithHighlightedText = (
  text: string,
  query: string,
  className: string
) => {
  const regex = new RegExp(query, "gi");
  const match = text.match(regex);
  if (!match) return text;
  const highlightedText = text.replace(
    regex,
    `<span class="${className}">$&</span>`
  );
  return highlightedText;
};
</script>

<template>
  <div
    v-if="search.focused"
    class="gradient-border p-[1.5px] w-full absolute top-20 rounded-xl group-scoped-focus-within:w-[calc(100%-50px)] transition-all duration-500"
    @click="(e) => e.stopPropagation()"
  >
    <div v-if="search.results?.length === 0">
      <div
        class="bg-background rounded-[14px] p-12 shadow-black shadow-2xl w-full h-28 flex items-center justify-center text-white text-lg font-medium"
      >
        <div class="flex flex-col items-center justify-center space-y-1">
          <!-- <icon
                        name="line-md:downloading-loop"
                        size="30px"
                        class="text-gray-200"
                      /> -->
          <img
            src="@/assets/images/logo_transparent.png"
            class="h-8 my-2 spin-logo transition-all ease-in-out"
          />
          <p v-if="isFetching">Searching...</p>
          <p v-if="search.query.length > 0 && !isFetching">No results found</p>
          <p v-if="search.query.length === 0">
            Search for snippets by title, description, or tags
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="search.results?.length > 0"
      class="bg-background w-full h-auto max-h-[50vh] overflow-y-auto rounded-[14px] shadow-black shadow-2xl transition-all duration-500 py-1"
    >
      <transition-group name="snippets-search-list" tag="div">
        <nuxt-link
          v-for="result in search.results"
          :key="result._id.toString()"
          :to="`/snippets/${result._id.toString()}`"
          class="w-full py-5 h-fit flex flex-col items-start justify-start pl-5 text-white text-lg font-medium transition-all duration-75 relative group"
        >
          <div
            class="text-white/30 group-hover:block hidden absolute right-5 top-1/2 transform -translate-y-1/2"
          >
            <icon name="line-md:chevron-right" size="1.4em" />
          </div>

          <div
            v-html="
              getSpanWithHighlightedText(
                result.title,
                search.query,
                'text-primary'
              )
            "
          />
          <p
            class="text-base text-white/40 truncate overflow-hidden overflow-ellipsis w-full pr-10"
            v-html="
              getSpanWithHighlightedText(
                result.description,
                search.query,
                'bg-white/[0.15]'
              )
            "
          />
        </nuxt-link>
      </transition-group>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.spin-logo {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
