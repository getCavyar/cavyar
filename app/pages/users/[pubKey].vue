<script setup lang="ts">
import { PublicKey } from "@solana/web3.js";
import { Snippet, User } from "~/ts/types";
import { getAvatar, shortenPublicKey } from "~/ts/utils";

const route = useRoute();

const { pubKey } = route.params;

const isValidPubKey = computed(() => {
  return PublicKey.isOnCurve(pubKey);
});

const fetchData = async ({
  currentPage,
  currentPageSize,
}: {
  currentPage: number;
  currentPageSize: number;
}) => {
  const offset = (currentPage - 1) * currentPageSize;

  const res = await $fetch(`/api/users/${pubKey}/snippets`, {
    query: {
      limit: currentPageSize,
      offset,
    },
  });

  userSnippets.value = [
    ...(userSnippets.value ?? []),
    ...(res.data as Snippet[]),
  ];
};

const { data: snippetsData } = await useAsyncData(
  "snippets",
  () =>
    $fetch(`/api/users/${pubKey}/snippets`, {
      query: {
        initial: true,
        limit: 9,
        offset: 0,
      },
    }),
  {
    transform: (value) => {
      return value.data as {
        userSnippets: Snippet[];
        totalSnippetsCount: number;
        totalLikesCount: number;
      };
    },
  }
);

const { data: userData } = await useAsyncData(
  "user",
  () => $fetch(`/api/users/${pubKey}/profile`),
  {
    transform: (value) => {
      return value.data as User;
    },
  }
);

const userPage = ref<HTMLElement | null>(null);

if (process.client) {
  useInfiniteScroll(
    window,
    () => {
      next();
    },
    {
      distance: 400,
    }
  );
}

const { next } = useOffsetPagination({
  page: 1,
  total: snippetsData.value?.totalSnippetsCount,
  pageSize: 9,
  onPageChange: fetchData,
  onPageSizeChange: fetchData,
});

const userSnippets = useState("userSnippets", () => {
  return snippetsData.value?.userSnippets ?? [];
});

const config = useRuntimeConfig();

const onClickGithubButton = () => {
  if (userData.value?.username) {
    disconnectGithub();
  } else {
    signInWithGithub();
  }
};

const disconnectGithub = () => {};

const signInWithGithub = () => {
  const redirectUri = "http://localhost:3000/api/github/callback";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.public.githubClientId}&redirect_uri=${redirectUri}`;

  window.location.href = authUrl;
};
</script>

<template>
  <div
    ref="userPage"
    class="w-screen min-h-screen px-5 py-20 pt-28 relative flex items-start justify-center"
  >
    <div class="max-w-7xl w-full justify-start items-start">
      <main class="flex flex-col items-start justify-start">
        <div
          v-if="userData"
          class="w-full flex flex-row justify-between items-center"
        >
          <div class="flex flex-row items-center space-x-6">
            <img
              :src="userData.avatarUrl"
              class="w-20 h-20 rounded-lg border-4 border-white/10"
            />
            <div class="flex flex-col items-start justify-start space-y-2">
              <div class="flex flex-row items-center justify-center space-x-3">
                <p class="text-2xl font-semibold">
                  {{ userData.username ?? userData.publicKey.slice(0, 4) }}
                </p>

                <button
                  v-tooltip="
                    userData.username ? 'Disconnect Github' : 'Connect Github'
                  "
                  :class="[
                    'github-button',
                    userData.username
                      ? 'github-button--connected'
                      : 'github-button--disconnected',
                  ]"
                  @click="onClickGithubButton"
                >
                  <icon name="bi:github" size="35px" class="text-white/70" />
                </button>
              </div>
              <a
                target="_blank"
                :href="`https://solscan.io/address/${userData.publicKey}`"
                class="px-2 py-1 rounded-md flex flex-row space-x-1 items-center text-white/40 border border-white/5 hover:border-white/10 hover:text-white/50 transition-colors duration-300"
              >
                <icon name="formkit:solana" size="1.1em" />
                <p class="text-sm">
                  {{ shortenPublicKey(userData.publicKey) }}
                </p>
              </a>
            </div>
          </div>
        </div>

        <div class="w-full pt-10">
          <div class="space-y-8 flex flex-col items-start justify-center">
            <div class="top-5 space-x-8 flex flex-row text-lg font-medium">
              <p class="border-b-2 border-primary/80 pb-2">Snippets</p>
              <p class="text-white/50">Saved</p>
            </div>

            <div
              v-if="userSnippets && userSnippets?.length > 0"
              class="w-full flex flex-col"
            >
              <transition-group
                name="user-snippets-list"
                tag="div"
                style="
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                  grid-gap: 20px;
                "
              >
                <nuxt-link
                  v-for="snippet in userSnippets"
                  :key="snippet._id.toString()"
                  :to="`/snippets/${snippet._id.toString()}`"
                  class="snippet-card w-full"
                >
                  <p class="text-xl font-medium text-white/90 line-clamp-2">
                    {{ snippet.title }}
                  </p>
                  <p class="text-sm text-white/80 line-clamp-2">
                    {{ snippet.description }}
                  </p>
                  <div class="flex flex-wrap items-start justify-start">
                    <p
                      v-for="tag in snippet.tags"
                      :key="tag"
                      class="px-2 py-1 mt-1.5 mr-1.5 bg-white/5 rounded-md text-sm border border-white/10 h-8 w-max"
                    >
                      {{ tag }}
                    </p>
                  </div>
                  <div
                    class="w-full flex flex-row justify-between items-center pt-2"
                  >
                    <div class="w-full flex flex-row items-center space-x-2">
                      <img
                        class="h-5 w-5 rounded-full"
                        :src="getAvatar(snippet.creator)"
                        alt=""
                      />
                      <p class="text-sm text-white/80">
                        {{
                          snippet.creator.slice(0, 4) +
                          "..." +
                          snippet.creator.slice(-4)
                        }}
                      </p>
                    </div>
                    <div
                      class="w-full flex flex-row items-center justify-end space-x-2 text-white/80"
                    >
                      <icon
                        name="ph:heart-straight"
                        size="1.4em"
                        class="text-red-800/80"
                      />
                      <p class="text-base">{{ snippet.likes.length }}</p>
                    </div>
                  </div>
                </nuxt-link>
              </transition-group>

              <button
                v-if="
                  snippetsData?.totalSnippetsCount &&
                  snippetsData?.totalSnippetsCount > userSnippets.length
                "
                class="w-fit mx-auto mt-3 py-5 pl-2 text-white/50 text-base hover:text-primary transition-colors duration-500"
                @click="next"
              >
                Load More
              </button>
            </div>

            <div v-else-if="!isValidPubKey">
              <p class="text-white/80 text-center">
                This user doesn't exist (Public Key is invalid). <br />Please
                check the URL.
              </p>
            </div>

            <div v-else>
              <p class="text-white/80">
                No snippets found.
                <nuxt-link
                  v-if="userData?.publicKey === pubKey"
                  class="text-primary/80 hover:underline"
                  to="/create"
                  >Create one</nuxt-link
                >
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.snippet-card {
  background: linear-gradient(140deg, #0c0c0c, #000000);
  @apply px-5 py-4 space-y-2 flex flex-col justify-between items-start rounded-2xl border-[1.5px] border-white/10 cursor-pointer transition-all duration-300;
}

.snippet-card:hover {
  @apply border-primary/70;
}

.github-button {
  @apply h-[35px] w-[35px] p-1.5 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all duration-300;
}

.github-button--connected {
  background: linear-gradient(140deg, #109093, #000000);
}

.github-button--disconnected {
  background: linear-gradient(140deg, #850808, #000000);
}
</style>
