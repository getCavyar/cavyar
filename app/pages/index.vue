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
  },
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

const scrollBlurOverlay = ref<HTMLElement | null>(null);
const scrollDarkOverlay = ref<HTMLElement | null>(null);

onMounted(() => {
  const scrollDarkOverlayEl = scrollDarkOverlay.value;
  const scrollBlurOverlayEl = scrollBlurOverlay.value;
  if (scrollDarkOverlayEl && scrollBlurOverlayEl) {
    scrollDarkOverlayEl.style.opacity = "0";
    scrollBlurOverlayEl.style.opacity = "0";
    const handleScroll = () => {
      const opacity = window.scrollY / 800;
      scrollDarkOverlayEl.style.opacity = opacity.toString();
      scrollBlurOverlayEl.style.opacity = opacity.toString();
    };
    window.addEventListener("scroll", handleScroll);
    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  }
});
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="w-screen relative flex flex-col">
    <div class="relative">
      <div
        ref="scrollDarkOverlay"
        class="w-screen h-screen bg-black z-20 absolute pointer-events-none"
      />
      <div
        ref="scrollBlurOverlay"
        class="w-screen h-screen backdrop-blur-2xl z-10 absolute pointer-events-none"
      />
      <div
        class="pb-5 h-screen w-screen fixed z-0 flex flex-col items-center justify-center space-y-8"
      >
        <div
          class="pb-5 h-screen w-screen z-0 flex"
          @click="search.focused = false"
        >
          <div
            :class="[
              'w-full flex items-center justify-center flex-col space-y-2 transition-all duration-500',
              search.focused ? 'mb-[60vh]' : 'pt-0',
            ]"
          >
            <div class="relative h-24 flex items-center justify-center">
              <img
                src="@/assets/images/logo_transparent.png"
                alt=""
                :class="[
                  'transition-all duration-700 cavyar-logo-animation object-contain',
                  search.focused
                    ? 'h-28 mb-3 rotate-90 blur-2xl'
                    : 'h-[40vw] mt-20 blur-[20px] opacity-60 brightness-[0.4]',
                ]"
              />
              <h1
                :class="[
                  'absolute font-bold tracking-wide transition-all duration-700',
                  search.focused
                    ? 'text-[50px] sm:text-[60px]'
                    : 'text-[60px] sm:text-[70px]',
                ]"
              >
                CAVYAR
              </h1>
            </div>

            <index-search-box
              :search="search"
              :is-fetching="isFetching"
              :query-snippets="querySnippets"
            >
              <transition name="blur-up">
                <index-search-results
                  :search="search"
                  :is-fetching="isFetching"
                />
              </transition>
            </index-search-box>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden">
      <div
        class="mt-[100vh] relative min-h-screen bg-black/80 backdrop-blur-2xl z-30 pt-10"
        style="box-shadow: 0px -10px 20px rgba(0, 0, 0, 0.3)"
      >
        <div
          v-for="category in ['Popular', 'Recent']"
          :key="category"
          class="space-y-3 flex flex-col p-10"
        >
          <div class="flex flex-row items-center justify-center space-x-5">
            <div class="w-full h-0.5 bg-white/10" />
            <h3 class="text-center">{{ category }}</h3>
            <div class="w-full h-0.5 bg-white/10" />
          </div>
          <div class="flex justify-center items-center">
            <div
              class="max-w-7xl flex flex-row flex-wrap items-center justify-center"
            >
              <div
                v-for="snippet in category === 'Popular'
                  ? discoveryResponse?.topSnippets
                  : discoveryResponse?.recentSnippets"
                :key="snippet._id.toString()"
                class="p-4"
              >
                <lazy-snippet-card :snippet="snippet" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.gradient-border {
  background: linear-gradient(
    200deg,
    rgb(var(--primary)),
    rgb(var(--secondary)),
    rgb(var(--primary)),
    rgb(var(--secondary))
  );
}

.cavyar-logo-animation {
  animation: cavyar-logo-animation 30s ease-in-out infinite;
}

@keyframes cavyar-logo-animation {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
