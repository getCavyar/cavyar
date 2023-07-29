<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
import { useChat } from "ai/vue";
import { DialogType, useDialogStore } from "~/stores/dialogStore";
import { connection } from "~/ts/constants";
import { Snippet } from "~/ts/types";
import { getAvatar, shortenPublicKey } from "~/ts/utils";
import { useSnippetCreationStore } from "~~/stores/snippetCreationStore";

//! EXPERIMENTAL
const { messages, input, handleSubmit } = useChat();
//! EXPERIMENTAL

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
  }
);

const copyCode = (code: string) => {
  if (process.browser) {
    navigator.clipboard.writeText(code);
  }
};
const frameworkIcon = computed(
  () => frameworks.filter((f) => f.name === snippet.value?.framework)[0].icon
);

const { frameworks, selectedSnippetFrameworkLanguage } =
  useSnippetCreationStore();

const regex = /\${\d+:(.+?)}/g;
const prettyCode = computed(() => {
  if (!snippet.value?.code) return;
  // const matches = snippet.value.code.matchAll(regex);
  // for (const match of matches) {
  //   snippet.value.code = snippet.value?.code.replace(match[0], match[1]);
  // }
  // return snippet.value?.code;

  const code = snippet.value.code.replace(/\$\{\d+:(.*?)\}/g, (match, p1) => {
    return p1;
  });
  return code;
});

const formatDate = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return date.toLocaleDateString(undefined, options);
};

const alreadyLiked = computed(() => {
  return snippet.value?.likes.includes(userData.value?.user?.name ?? "");
});

const likeSnippet = async () => {
  try {
    const res = await $fetch(
      `/api/snippets/${snippet.value?._id.toString()}/like`,
      {
        method: "POST",
      }
    );
    if (res.statusCode === 200) {
      snippet.value = res.data;
    }
    // eslint-disable-next-line no-console
    console.log(res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

const { openDialog } = useDialogStore();

const tipCreator = () => {
  if (!publicKey.value) {
    openDialog(DialogType.Info, "Please connect your wallet to tip!");
    return;
  }
  openDialog(
    DialogType.Tip,
    "Did this snippet help you? Tip the creator to show your appreciation! ♥️",
    [1, 2.5, 5, 10].map((amount) => {
      return {
        label: `$${amount}`,
        callback: () => tipInSol(amount),
      };
    })
  );
};

const calculateTip = (usd: number, price: number) => {
  const lamportsPerUsd = Math.round((LAMPORTS_PER_SOL / price) * 100) / 100;
  const lamports = Math.round(usd * lamportsPerUsd);
  return lamports;
};

const tipInSol = async (usd: number) => {
  if (!publicKey.value || !snippet?.value?.creator) return;

  const res = await $fetch("/api/solana-price");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey.value,
      toPubkey: new PublicKey(snippet.value.creator),
      lamports: calculateTip(usd, res.data),
    })
  );

  await sendTransaction(tx, connection);
};

const deleteSnippet = () => {
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
              }
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
    ]
  );
};
</script>

<template>
  <div
    v-if="!pending && snippet !== null"
    class="w-full py-16 relative flex items-start justify-center"
  >
    <div class="max-w-7xl">
      <div class="pt-5 flex flex-row space-x-14">
        <main class="space-y-3 flex flex-col items-start justify-start">
          <div class="flex flex-row items-center space-x-3">
            <img :src="frameworkIcon" alt="" class="h-8 w-8 rounded-full" />
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
            <!-- <icon
          name="line-md:clipboard-check-twotone-to-clipboard-twotone-transition"
          size="1.4em"
          class="absolute right-2 top-2 z-10 cursor-pointer rounded-full text-primary/60 hover:text-primary/100 transition-all duration-300 active:text-secondary"
          @click="copyCode(snippet!.code)"
        /> -->
            <Prism :language="selectedSnippetFrameworkLanguage">
              {{ prettyCode }}
            </Prism>
          </div>

          <div class="pt-10">
            <h4 class="ai-title">AI Generated Description</h4>
            <p>
              This description was generated by an AI model trained on thousands
              of lines of solana code.
            </p>
            <div class="flex flex-col">
              <p
                v-for="message in messages"
                :key="message.id"
                class="mt-2 mb-2 py-3 px-4 border-[2px] border-white/10 rounded-xl"
              >
                <span class="text-white/60 text-sm">{{ message.content }}</span>
                <!-- <span class="typewriter-effect" style="--n: 1000">
              {{
                snippet.aiExplanation ?? "No explanation available at the moment"
              }}
            </span> -->
              </p>
              <!-- <form class="mt-10" @submit="handleSubmit">
          <input
          v-model="input"
          class="fixed bottom-0 w-full max-w-md p-2 mb-8 bg-black rounded shadow-xl"
          placeholder="Say something..."
          />
        </form> -->
            </div>
          </div>
        </main>

        <div class="w-80 h-32 sticky top-8 space-y-8">
          <div class="flex flex-col items-start justify-start space-y-2">
            <p class="text-sm text-white/50">Created by:</p>
            <nuxt-link
              :to="`/users/${snippet.creator}`"
              class="flex flex-row items-center space-x-3"
            >
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

          <div class="flex flex-row space-x-2">
            <button
              class="py-2.5 relative flex flex-row items-center justify-center rounded-lg bg-gradient-to-br from-surface via-surface/30 to-black font-medium text-white/70 border border-white/10 group group-hover:bg-black transition-all duration-500 w-full px-4"
            >
              <div
                class="group-active:opacity-0 transition-opacity duration-300"
              >
                Copy
                <icon
                  name="ri:code-s-slash-fill"
                  size="1.2em"
                  class="ml-2 group-hover:ml-1 group-active:ml-1 transition-all duration-500 text-white/70"
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
            >
              <div
                class="group-active:opacity-0 transition-opacity duration-300"
              >
                <icon
                  name="material-symbols:bookmark-outline-rounded"
                  size="1.2em"
                  class="text-white/70"
                />
              </div>
            </button>
          </div>

          <div class="flex flex-col space-y-5">
            <div
              class="w-full h-28 p-4 flex flex-col items-start justify-start relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-red/80 via-dark-red/30 to-black border border-dark-red"
            >
              <p class="font-medium text-white/70">
                Give this snippet a feedback!
              </p>
              <div class="flex flex-row space-x-2 mt-2">
                <button
                  class="p-1.5 px-3 border border-white/5 rounded-lg text-white/70 hover:text-green-400 bg-black/30 hover:bg-black/40 transition-all duration-300"
                >
                  <icon
                    name="mingcute:thumb-up-2-line"
                    size="1.4em"
                    class="text-white/50 hover:text-green-500 transition-all duration-300"
                  />
                </button>
                <button
                  class="p-1.5 px-3 border border-white/5 rounded-lg text-white/70 hover:text-green-400 bg-black/30 hover:bg-black/40 transition-all duration-300"
                >
                  <icon
                    name="mingcute:thumb-down-2-line"
                    size="1.4em"
                    class="text-white/50 hover:text-red-700 transition-all duration-300"
                  />
                </button>
              </div>
              <icon
                name="line-md:heart-twotone"
                size="9em"
                class="text-red-950 absolute -z-10 -right-5 -bottom-8 rotate-12"
              />
            </div>

            <div
              class="w-full h-28 p-4 flex flex-col items-start justify-start relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-blue/80 via-dark-blue/30 to-black border border-dark-blue"
            >
              <p class="font-medium text-white/70">Publishing date</p>
              <p class="mt-2 ml-1 font-medium text-xl text-white/80">
                {{
                  new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </p>
              <icon
                name="line-md:calendar"
                size="9em"
                class="text-blue-950 absolute -z-10 -right-5 -bottom-8 rotate-12"
              />
            </div>

            <div
              class="w-full h-28 p-4 flex flex-col items-start justify-start relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-green/80 via-dark-green/30 to-black border border-dark-green"
            >
              <p class="font-medium text-white/70">
                Want to support the author?
              </p>
              <div class="flex flex-row space-x-2 mt-2">
                <button
                  v-for="tipAmount in [1, 2.5, 5, 10]"
                  :key="tipAmount"
                  class="p-2 rounded-lg border border-white/5 text-white/70 hover:text-green-400 bg-black/30 hover:bg-black/40 transition-all duration-300"
                >
                  {{
                    tipAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  }}
                </button>
              </div>
              <icon
                name="line-md:buy-me-a-coffee-twotone"
                size="9em"
                class="text-green-950 absolute -z-10 -right-4 -bottom-8 rotate-12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
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

.typewriter-effect {
  color: transparent;
  background:
    linear-gradient(-90deg, #0000 0, #0000 5px) 10px 0,
    linear-gradient(white 0 0) 0 0;
  background-size: calc(var(--n) * 1ch) 200%;
  -webkit-background-clip: padding-box, text;
  background-clip: padding-box, text;
  background-repeat: no-repeat;
  animation:
    b 0.03s infinite steps(1),
    t calc(var(--n) * 0.03s) steps(var(--n)) forwards;
}

@keyframes t {
  from {
    background-size: 0 200%;
  }
}

@keyframes b {
  50% {
    background-position:
      0 -100%,
      0 0;
  }
}
</style>
