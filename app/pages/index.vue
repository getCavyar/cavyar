<script setup lang="ts">
import { Snippet, DiscoveryResponse } from "~~/ts/types";

const { data: discoveryResponse } = await useAsyncData(
  "snippets",
  () =>
    $fetch("/api/snippets", {
      query: { discovery: true },
    }),
  {
    transform: (value) => {
      // @ts-ignore
      return value.data as DiscoveryResponse;
    },
  }
);

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
          // @ts-ignore
          return value.data as Snippet[];
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

<!-- eslint-disable vue/no-v-html -->
<template>
  <nuxt-layout name="index">
    <template #content>
      <div
        class="radial-gradient pb-5 h-screen w-screen fixed z-0 flex"
        @click="search.focused = false"
      >
        <div
          :class="[
            'w-full flex items-center justify-center flex-col space-y-2 transition-all duration-500',
            search.focused ? 'mb-[calc(50vh-80px)]' : 'pt-0',
          ]"
        >
          <!-- <img
            src="@/assets/images/logo_white.png"
            :class="[
              'transition-all duration-700',
              search.focused ? 'h-10' : 'h-12',
            ]"
          /> -->

          <h1
            :class="[
              'font-extrabold tracking-wider transition-all duration-700',
              search.focused ? 'text-[60px]' : 'text-[70px]',
            ]"
          >
            CAVYAR
          </h1>

          <div
            class="w-1/2 max-w-3xl h-16 relative flex items-center justify-center group-scoped transition-all"
          >
            <input
              v-model="search.query"
              :class="[
                'w-full h-full pl-16 py-1 px-4 text-white text-lg font-medium group-scoped-focus-within:w-[calc(100%-50px)] focus:bg-background placeholder:text-white/40 backdrop-blur-2xl rounded-xl shadow-lg shadow-black/20 border hover:border-primary focus:border-primary transition-all duration-500',
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
            <transition name="blur-up">
              <div
                v-if="search.focused"
                class="gradient-border p-[1.5px] w-full absolute top-20 rounded-xl group-scoped-focus-within:w-[calc(100%-50px)] transition-all duration-500"
                @click="(e) => e.stopPropagation()"
              >
                <div v-if="search.results?.length === 0">
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
                      <p v-if="isFetching">Searching...</p>
                      <p v-if="search.query.length > 0 && !isFetching">
                        No results found
                      </p>
                      <p v-if="search.query.length === 0">
                        Search for snippets by title, description, or tags
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  v-if="search.results?.length > 0"
                  class="bg-background w-full h-auto max-h-[50vh] overflow-y-auto rounded-[11px] shadow-black shadow-2xl transition-all duration-500 py-1"
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
            </transition>
          </div>
        </div>
      </div>
    </template>

    <template #popular>
      <div
        v-for="topSnippets in discoveryResponse?.topSnippets"
        :key="topSnippets._id.toString()"
        class="p-4"
      >
        <lazy-snippet-card :snippet="topSnippets" />
      </div>
    </template>

    <template #recent>
      <div
        v-for="recentSnippet in discoveryResponse?.recentSnippets"
        :key="recentSnippet._id.toString()"
        class="p-4"
      >
        <lazy-snippet-card :snippet="recentSnippet" />
      </div>
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
</style>
