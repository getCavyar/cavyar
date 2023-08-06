<!-- eslint-disable no-console -->
<script setup lang="ts">
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import { DialogType, useDialogStore } from "~/stores/dialogStore";
import { connection, frameworks } from "~/ts/constants";
import { Snippet, User } from "~/ts/types";
import { getAvatar, shortenPublicKey } from "~/ts/utils";

const md = markdownit({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (_) {}
    }

    return ""; // Use external default escaping
  },
});

const renderedMarkdown = computed(() => {
  return md.render(snippet.value?.aiExplanation ?? "");
});

// import { useChat } from "ai/vue";
// const { messages, input, handleSubmit } = useChat();

const { sendTransaction, publicKey } = useWallet();

const { data: userData } = useAuth();

const route = useRoute();

const { data: snippet, pending } = await useAsyncData(
  "snippet",
  () => $fetch(`/api/snippets/${route.params.id}`),
  {
    transform: (value) => {
      return value.data as Snippet;
    },
  },
);

const copyCode = () => {
  // const snippetCreationStore = useSnippetCreationStore();
  // const code = snippetCreationStore.getSnippetCode(snippet.value?.code ?? "");
  if (!snippet.value?.code) return;
  navigator.clipboard.writeText(snippet.value.code);
};

const frameworkData = computed(() => {
  return frameworks.filter((f) => f.name === snippet.value?.framework)[0];
});

// const prettyCode = computed(() => {
//   if (!snippet.value?.code) return;
//   const code = snippet.value.code.replace(/\$\{\d+:(.*?)\}/g, (_, p1) => {
//     return p1;
//   });
//   return code;
// });

const alreadyLiked = computed(() => {
  return (
    snippet.value?.likes?.includes(userData.value?.user?.name ?? "") ?? false
  );
});

const alreadyDisliked = computed(() => {
  return (
    snippet.value?.dislikes?.includes(userData.value?.user?.name ?? "") ?? false
  );
});

const handleLike = async () => {
  try {
    const res = await $fetch(
      `/api/snippets/${snippet.value?._id.toString()}/like`,
      {
        method: "POST",
      },
    );
    if (res.statusCode === 200) {
      snippet.value = res.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const handleDislike = async () => {
  try {
    const res = await $fetch(
      `/api/snippets/${snippet.value?._id.toString()}/dislike`,
      {
        method: "POST",
      },
    );
    if (res.statusCode === 200) {
      snippet.value = res.data;
    }
  } catch (err) {
    console.error(err);
  }
};

// TODO - start
const { data: user, refresh } = await useAsyncData(
  "user",
  () => $fetch(`/api/users/${publicKey.value}/profile`),
  {
    transform: (value) => {
      return value.data as User;
    },
  },
);

const isBookmarked = computed(() => {
  return (
    user.value?.bookmarks?.includes(snippet.value?._id.toString() ?? "") ??
    false
  );
});

const toggleBookmark = async () => {
  try {
    const res = await $fetch(
      `/api/snippets/${snippet.value?._id.toString()}/bookmark`,
      {
        method: "POST",
      },
    );
    if (res.statusCode === 200) {
      refresh();
    }
  } catch (err) {
    console.error(err);
  }
};

const { openDialog } = useDialogStore();

const handleTip = (amount: number) => {
  if (!publicKey.value) {
    openDialog(DialogType.Info, "Please connect your wallet to tip!");
    return;
  }
  tipInSol(amount);
};

const calculateTip = (usd: number, price: number) => {
  const lamportsPerUsd = Math.round((LAMPORTS_PER_SOL / price) * 100) / 100;
  const lamports = Math.round(usd * lamportsPerUsd);
  return lamports;
};

const tipInSol = async (usd: number) => {
  if (!publicKey.value || !snippet?.value?.creator) return;

  const res = await $fetch("/api/solana-price");

  if (res.statusCode !== 200) {
    openDialog(DialogType.Error, "Couldn't fetch Coingecko prices!");
    return;
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey.value,
      toPubkey: new PublicKey(snippet.value.creator),
      lamports: calculateTip(usd, res.data),
    }),
  );
  await sendTransaction(tx, connection);
};

/* const deleteSnippet = () => {
  openDialog(
    DialogType.Warning,
    "Are you sure you want to delete this snippet?",
    [
      {
        label: "Cancel",
        callback: () => {},
      },
      {
        label: "Yes",
        callback: async () => {
          try {
            const res = await $fetch(
              `/api/snippets/${snippet.value?._id.toString()}/delete`,
              {
                method: "DELETE",
              },
            );
            if (res.statusCode === 200) {
              navigateTo("/snippets");
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
          }
        },
      },
    ],
  );
}; */
</script>

<template>
  <div
    v-if="!pending && snippet !== null"
    class="w-full py-16 relative flex items-start justify-center"
  >
    <div class="w-full max-w-7xl p-5">
      <div
        class="pt-5 flex flex-col space-y-10 lg:flex-row lg:space-x-14 lg:space-y-0"
      >
        <main class="space-y-3 flex flex-col items-start justify-center">
          <div class="flex flex-row items-center space-x-3">
            <img
              :src="frameworkData!.icon"
              alt=""
              width="32"
              height="32"
              class="rounded-full"
            />
            <h3>{{ snippet.title }}</h3>
          </div>

          <div class="flex flex-wrap">
            <div
              v-for="tag in snippet.tags"
              :key="tag"
              class="p-0.5 px-2 mr-2 mb-2 bg-gradient-to-br text-white/80 from-secondary/30 to-secondary/10 rounded-[4px]"
            >
              {{ tag }}
            </div>
          </div>

          <p class="pb-2">{{ snippet.description }}</p>

          <div class="gradient-border w-full rounded-2xl relative">
            <div
              class="absolute z-10 flex flex-row items-center space-x-2 right-3 top-3 lg:hidden"
            >
              <button
                v-if="userData?.user"
                class="w-9 h-9 flex items-center justify-center rounded-lg shadow-xl shadow-black bg-surface/30 backdrop-blur-sm border border-white/10 hover:text-primary/80 active:text-primary text-primary/60 transition-colors duration-200 ease-in-out"
                @click="toggleBookmark"
              >
                <icon
                  :name="
                    isBookmarked
                      ? 'material-symbols:bookmark-rounded'
                      : 'material-symbols:bookmark-outline-rounded'
                  "
                  size="24px"
                />
              </button>
              <button
                class="w-9 h-9 flex items-center justify-center rounded-lg shadow-xl shadow-black bg-surface/30 backdrop-blur-sm border border-white/10 hover:text-primary/80 active:text-primary text-primary/60 transition-colors duration-200 ease-in-out"
                @click="copyCode"
              >
                <icon
                  name="material-symbols:content-copy-outline-rounded"
                  size="23px"
                />
              </button>
            </div>
            <client-only>
              <Prism
                v-if="frameworkData.language"
                :language="frameworkData.language"
              >
                {{ snippet.code }}
              </Prism>
            </client-only>
          </div>

          <div class="w-full pt-10 space-y-5 flex flex-col">
            <div class="flex flex-row items-center space-x-3">
              <img
                src="/logo_transparent.png"
                alt=""
                width="30px"
                height="30px"
                class="cavyar-logo-hover"
              />

              <p class="text-3xl">CAVYAR AI</p>
            </div>
            <p class="text-white/80">
              CAVYAR AI is in its earliest stages of development and the quality
              of generated descriptions will improve massively over time. At
              this stage, there is a risk of false information being generated.
            </p>

            <div class="flex flex-col">
              <div
                class="p-4 flex flex-col space-y-3 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-white/10"
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="markdown-content" v-html="renderedMarkdown"></div>
              </div>

              <div
                class="h-12 w-full mt-4 px-4 flex items-center justify-between border border-white/10 rounded-xl"
              >
                <div
                  class="flex flex-row items-center space-x-2 text-white opacity-40"
                >
                  <p>Ask</p>
                  <img
                    src="/logo_transparent.png"
                    alt=""
                    width="20px"
                    height="20px"
                    class="grayscale"
                  />
                  <p>Soon™</p>
                </div>

                <icon name="uil:enter" size="1.3em" class="text-white/30" />
              </div>
            </div>
          </div>
        </main>

        <div class="w-full h-min lg:w-80 sticky top-16 space-y-8">
          <div
            class="flex flex-col items-center lg:items-start justify-start space-y-2"
          >
            <p class="text-sm text-white/50">Created by:</p>
            <nuxt-link
              :to="`/users/${snippet.creator}`"
              class="flex flex-row items-center space-x-3"
            >
              <!-- TODO include creator avatar in http request -->
              <img
                :src="getAvatar(snippet.creator)"
                class="w-7 h-7 rounded-sm"
              />
              <div class="flex flex-row space-x-1.5">
                <div
                  class="h-[34px] px-3 flex flex-row items-center border border-white/10 rounded-md text-sm"
                >
                  {{ shortenPublicKey(snippet.creator) }}
                </div>
                <div
                  class="h-[34px] px-3 flex flex-row items-center border border-white/10 rounded-md"
                >
                  <icon name="mdi:crown" class="text-yellow-500" />
                </div>
              </div>
            </nuxt-link>
          </div>

          <div class="lg:flex flex-row space-x-2 hidden">
            <button
              class="py-2.5 relative flex flex-row items-center justify-center rounded-lg bg-gradient-to-br from-surface via-surface/30 to-black font-medium text-white/70 border border-white/10 group group-hover:bg-black transition-all duration-500 w-full px-4"
              @click="copyCode()"
            >
              <div
                class="group-active:opacity-0 text-white/70 transition-opacity duration-300"
              >
                Copy
                <icon
                  name="ri:code-s-slash-fill"
                  size="1.2em"
                  class="ml-2 group-hover:ml-1 group-active:ml-1 transition-all duration-500"
                />
              </div>

              <div
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-300"
              >
                <icon name="ri:code-s-slash-fill" size="1.2em" />
              </div>
            </button>

            <button
              class="py-2.5 px-4 relative flex flex-row items-center justify-center rounded-lg bg-gradient-to-br from-surface via-surface/30 to-black font-medium text-white border border-white/10"
              :disabled="!userData?.user"
              @click="toggleBookmark"
            >
              <div
                class="group-active:opacity-0 transition-opacity duration-300"
              >
                <icon
                  name="material-symbols:bookmark-outline-rounded"
                  size="1.2em"
                  :class="[isBookmarked ? 'text-primary' : 'text-white/70']"
                />
              </div>
            </button>
          </div>

          <div
            class="flex flex-wrap lg:flex-col items-center justify-center lg:space-y-5"
          >
            <SnippetDetailsCard
              class="bg-gradient-to-r from-dark-red/80 via-dark-red/30 to-black border border-dark-red"
              title="Give this snippet a feedback!"
            >
              <template #icon>
                <icon
                  name="line-md:heart-twotone"
                  size="9em"
                  class="text-red-800 absolute -z-10 -right-5 -bottom-8 rotate-12"
                />
              </template>
              <button
                class="p-1.5 px-3 border border-white/5 rounded-lg text-white/70 hover:text-green-400 bg-black/30 hover:bg-black/40 transition-all duration-300"
                :disabled="!userData?.user"
                @click="handleLike"
              >
                <icon
                  name="mingcute:thumb-up-2-line"
                  size="1.4em"
                  :class="[
                    'hover:text-green-700 transition-all duration-150',
                    alreadyLiked ? 'text-green-700' : 'text-white/50',
                  ]"
                />
              </button>
              <button
                class="p-1.5 px-3 border border-white/5 rounded-lg text-white/70 hover:text-green-400 bg-black/30 hover:bg-black/40 transition-all duration-300"
                :disabled="!userData?.user"
                @click="handleDislike"
              >
                <!-- @click="handleDislike" -->
                <icon
                  name="mingcute:thumb-down-2-line"
                  size="1.4em"
                  :class="[
                    'hover:text-red-900 transition-all duration-150',
                    alreadyDisliked ? 'text-red-900' : 'text-white/50',
                  ]"
                />
              </button>
            </SnippetDetailsCard>

            <SnippetDetailsCard
              class="bg-gradient-to-r from-dark-blue/80 via-dark-blue/30 to-black border border-dark-blue"
              title="Published on"
            >
              <template #icon>
                <icon
                  name="line-md:calendar"
                  size="9em"
                  class="text-blue-800 absolute -z-10 -right-5 -bottom-8 rotate-12"
                />
              </template>

              <p class="mt-2 ml-1 font-medium text-xl text-white/80">
                {{
                  new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </p>
            </SnippetDetailsCard>

            <SnippetDetailsCard
              class="bg-gradient-to-r from-dark-green/80 via-dark-green/30 to-black border border-dark-green"
              title="Want to support the author?"
            >
              <template #icon>
                <icon
                  name="line-md:buy-me-a-coffee-twotone"
                  size="9em"
                  class="text-green-700 absolute -z-10 -right-4 -bottom-8 rotate-12"
                />
              </template>

              <button
                v-for="tipAmount in [1, 2.5, 5, 10]"
                :key="tipAmount"
                :disabled="!userData?.user"
                class="p-2 rounded-lg border border-white/5 text-white/70 hover:text-green-700 bg-black/30 hover:bg-black/40 transition-all duration-150"
                @click="() => handleTip(tipAmount)"
              >
                {{
                  tipAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                }}
              </button>
            </SnippetDetailsCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.gradient-border {
  padding: 0.5px;
  background: linear-gradient(
    200deg,
    rgba(var(--primary), 0.8),
    rgba(var(--secondary), 0.8),
    rgba(var(--primary), 0.8),
    rgba(var(--secondary), 0.8)
  );
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  word-break: break-word;
  white-space: pre-wrap;
  @apply backdrop-blur-3xl bg-background m-[1px] rounded-2xl;
}

.cavyar-logo-hover {
  animation: cavyar-logo-hover 5s ease-in-out infinite;
}

@keyframes cavyar-logo-hover {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(10deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
