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
import { getAvatar } from "~/ts/utils";
import { useSnippetCreationStore } from "~~/stores/snippetCreationStore";
//! EXPERIMENTAL

const { messages, input, handleSubmit } = useChat();
//! EXPERIMENTAL

const { sendTransaction, publicKey } = useWallet();

const { data: userData } = useAuth();

const route = useRoute();

const {
  data: snippet,
  pending,
  error,
} = await useAsyncData(
  "snippet",
  () => $fetch(`/api/snippets/${route.params.id}`),
  {
    transform: (value) => {
      return value.data as Snippet;
    },
  }
);

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
};

const { frameworks, selectedSnippetFrameworkLanguage } =
  useSnippetCreationStore();

const frameworkIcon = computed(
  () => frameworks.filter((f) => f.name === snippet.value?.framework)[0].icon
);

const regex = /\${\d+:(.+?)}/g;
const prettyCode = computed(() => {
  if (!snippet.value?.code) return;
  const matches = snippet.value.code.matchAll(regex);
  for (const match of matches) {
    snippet.value.code = snippet.value?.code.replace(match[0], match[1]);
  }
  return snippet.value?.code;
});

const shortenCreatorAddress = (name: string) => {
  return `${name.slice(0, 4)}...${name.slice(-4)}`;
};

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
  <div v-if="!pending && snippet !== null" class="pt-16 relative">
    <div
      class="w-[12vw] fixed top-28 left-10 flex flex-col items-start justify-start border-r-2 border-white/10 py-2"
    >
      <nuxt-link
        :to="`/users/${userData?.user?.name}`"
        :prefetch="true"
        class="flex flex-row items-end justify-center space-x-3"
      >
        <img
          :src="getAvatar(snippet.creator)"
          alt=""
          class="h-5 w-5 rounded-sm"
        />
        <p class="text-white/60 text-sm">
          {{ shortenCreatorAddress(snippet.creator) }}
        </p>
      </nuxt-link>

      <button
        v-if="snippet.creator == userData?.user?.name"
        class="mt-3 flex flex-row items-center justify-center space-x-2 text-red-800 hover:underline"
        @click="deleteSnippet"
      >
        <icon name="line-md:cancel-twotone" size="1.5em" />
        <p class="text-white/60 text-sm">Delete</p>
      </button>

      <button
        class="mt-3 flex flex-row items-center justify-center space-x-3 text-white/60"
        @click="likeSnippet()"
      >
        <icon
          name="line-md:heart-twotone"
          size="1.5em"
          :class="[alreadyLiked ? 'text-red-800' : 'text-white/60']"
        />
        <p class="text-white/60 text-sm">{{ snippet.likes.length }}</p>
      </button>

      <div
        class="mt-3 flex flex-row items-center justify-center space-x-3 text-white/60"
      >
        <icon name="line-md:calendar" size="1.5em" />
        <p class="text-white/60 text-sm">
          {{ formatDate(snippet.createdAt) }}
        </p>
      </div>

      <button
        class="mt-3 -ml-0.5 flex flex-row items-center justify-center space-x-2.5 text-white/60"
        @click="tipCreator"
      >
        <icon name="line-md:buy-me-a-coffee-twotone" size="1.6em" />
        <p class="text-white/60 text-sm">Tip Creator</p>
      </button>

      <div class="flex flex-wrap mt-5 text-white/60">
        <div
          v-for="tag in snippet.tags"
          :key="tag"
          class="px-2 py-1 mr-2 mb-2 bg-primary/10 rounded-sm text-xs"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <div
      class="w-[65vw] p-10 space-y-5 flex flex-col items-start justify-start left-1/2 -translate-x-1/2 absolute"
    >
      <div class="flex flex-row items-center justify-center space-x-3">
        <img :src="frameworkIcon" alt="" class="h-8 w-8 rounded-full" />
        <h3>{{ snippet.title }}</h3>
      </div>
      <p class="pb-2">{{ snippet.description }}</p>

      <div class="gradient-border w-full rounded-2xl relative">
        <icon
          name="line-md:clipboard-check-twotone-to-clipboard-twotone-transition"
          size="1.4em"
          class="absolute right-2 top-2 z-10 cursor-pointer rounded-full text-primary/60 hover:text-primary/100 transition-all duration-300 active:text-secondary"
          @click="copyCode(snippet!.code)"
        />
        <Prism :language="selectedSnippetFrameworkLanguage">
          {{ prettyCode }}
        </Prism>
      </div>

      <div class="pt-10">
        <h4 class="ai-title">AI Generated Description</h4>
        <p>
          This description was generated by an AI model trained on thousands of
          lines of solana code.
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
        </div>
        <form class="mt-10" @submit="handleSubmit">
          <input
            v-model="input"
            class="fixed bottom-0 w-full max-w-md p-2 mb-8 bg-black rounded shadow-xl"
            placeholder="Say something..."
          />
        </form>
      </div>
    </div>
  </div>
  <div v-else>{{ error ?? "Loading..." }}</div>
</template>

<style lang="postcss" scoped>
.gradient-border {
  background: linear-gradient(
    200deg,
    rgb(var(--primary)),
    rgb(var(--secondary)),
    rgb(var(--primary)),
    rgb(var(--secondary))
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
  background: linear-gradient(-90deg, #0000 0, #0000 5px) 10px 0,
    linear-gradient(white 0 0) 0 0;
  background-size: calc(var(--n) * 1ch) 200%;
  -webkit-background-clip: padding-box, text;
  background-clip: padding-box, text;
  background-repeat: no-repeat;
  animation: b 0.03s infinite steps(1),
    t calc(var(--n) * 0.03s) steps(var(--n)) forwards;
}

@keyframes t {
  from {
    background-size: 0 200%;
  }
}

@keyframes b {
  50% {
    background-position: 0 -100%, 0 0;
  }
}
</style>
