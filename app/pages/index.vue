<script setup lang="ts">
import { Snippet } from "~~/ts/types";
import BounceLoader from "vue-spinner/src/BounceLoader.vue";
import { BSON, deserialize } from "mongodb";
import { json } from "stream/consumers";

const { data } = await useAsyncData("snippets", () => $fetch("/api/snippets"), {
  transform: (value) => {
    console.log(value.snippets as unknown as Snippet[]);
    return value.snippets as unknown as Snippet[];
  },
});

const trendingSnippets = computed(() => {
  return data.value?.sort((a, b) => b.likes.length - a.likes.length);
});

const recentSnippets = computed(() => {
  return data.value?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

const search = reactive({
  focused: false,
  query: "",
  results: [] as Snippet[],
});

const isFetching = useState(() => false);

const querySnippets = useDebounceFn(async (query: string) => {
  if (query.length > 0) {
    try {
      isFetching.value = true;
      const { data: snippets } = await useFetch("/api/snippets", {
        query: { query },
        transform: (value) => {
          return value.snippets as unknown as Snippet[];
        },
      });
      search.results = snippets.value!;
      isFetching.value = false;
    } catch (err) {
      isFetching.value = false;
    }
  } else {
    search.results = [];
  }
}, 300);

const maxHeight = useState(() => 0);

const enter = (el: any) => {
  maxHeight.value = el.scrollHeight;
};
const beforeLeave = (el: any) => {
  maxHeight.value = el.scrollHeight;
};
const leave = () => {
  maxHeight.value = 0;
};
</script>

<template>
  <nuxt-layout name="index">
    <template #content>
      <div class="radial-gradient pb-5 h-screen w-screen fixed z-0 flex">
        <div
          :class="[
            'w-full flex items-center justify-center flex-col space-y-8 transition-all duration-500',
            search.focused ? 'mb-[calc(50vh-80px)]' : 'pt-0',
          ]"
        >
          <img
            src="@/assets/images/logo_white.png"
            :class="[
              'transition-all duration-700',
              search.focused ? 'h-10' : 'h-12',
            ]"
          />
          <div
            class="w-1/2 max-w-3xl h-16 relative flex items-center justify-center group transition-all"
          >
            <input
              class="w-full h-full pl-16 py-1 px-4 text-white text-lg font-medium bg-black/60 backdrop-blur-2xl rounded-xl shadow-xl shadow-black/40 border border-transparent hover:border-primary focus:border-primary transition-all duration-500"
              placeholder="PDA Signer Anchor..."
              @focus="() => (search.focused = true)"
              @blur="() => (search.focused = false)"
              @input="() => querySnippets(search.query)"
              v-model="search.query"
            />
            <icon
              name="line-md:search"
              size="1.4em"
              class="mb-0.5 absolute left-5 text-white group-hover:text-primary transition-all duration-500"
            />
            <transition name="blur-up">
              <div
                class="gradient-border p-[1.5px] w-full absolute top-20 rounded-xl"
                v-if="search.focused"
              >
                <div v-if="search.results.length === 0">
                  <div
                    class="bg-background rounded-[11px] p-12 shadow-black shadow-2xl w-full h-12 flex items-center justify-center text-white text-lg font-medium"
                  >
                    <div
                      class="flex flex-col items-center justify-center space-y-1"
                    >
                      <icon
                        name="line-md:downloading-loop"
                        size="30px"
                        class="text-gray-200"
                      />
                      <p>No results found</p>
                    </div>
                  </div>
                </div>
                <transition
                  name="height-transition"
                  @enter="enter"
                  @before-leave="beforeLeave"
                  @leave="leave"
                >
                  <div
                    class="bg-background w-full h-auto rounded-[11px] shadow-black shadow-2xl transition-all duration-500"
                    :style="{ maxHeight: `${maxHeight}px` }"
                  >
                    <transition-group name="snippets-search-list" tag="div">
                      <div
                        v-for="result in search.results"
                        :key="result._id"
                        class="w-full h-12 flex items-center justify-start pl-5 text-white text-lg font-medium hover:bg-primary/20 transition-all duration-500"
                      >
                        {{ result.title }}
                      </div>
                    </transition-group>
                  </div>
                </transition>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </template>

    <template #trending>
      <lazy-snippet-card
        v-for="trendingSnippet in trendingSnippets"
        :key="trendingSnippet._id.toString()"
        :snippet="trendingSnippet"
      />
    </template>

    <template #recent>
      <lazy-snippet-card
        v-for="recentSnippet in recentSnippets"
        :key="recentSnippet._id.toString()"
        :snippet="recentSnippet"
      />
    </template>
  </nuxt-layout>
</template>

<style scoped lang="postcss">
.radial-gradient {
  background: radial-gradient(
    ellipse at top,
    rgba(var(--primary), 0.3) 0%,
    black 75%
  );
}

.gradient-border {
  background: linear-gradient(
    200deg,
    rgb(var(--primary)),
    rgb(var(--secondary)),
    rgb(var(--primary)),
    rgb(var(--secondary))
  );
}

.height-transition-enter-active,
.height-transition-leave-active {
  transition: max-height 0.5s;
}
.height-transition-leave-to {
  max-height: 0;
}
</style>
