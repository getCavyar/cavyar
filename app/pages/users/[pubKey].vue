<script setup lang="ts">
import { PublicKey } from "@solana/web3.js";
import { Snippet } from "~/ts/types";
import { getAvatar } from "~/ts/utils";

const route = useRoute();

const { pubKey } = route.params;

const isValidPubKey = computed(() => {
  return PublicKey.isOnCurve(pubKey);
});

const { data } = useAuth();
const user = computed(() => {
  if (data.value?.user) {
    return data.value.user;
  }
});

const { data: userSnippets } = await useAsyncData(
  "snippets",
  () => $fetch(`/api/${pubKey}/snippets`),
  {
    transform: (value) => {
      return value.data as Snippet[];
    },
  }
);

const userSnippetsCount = computed(() => {
  if (userSnippets.value) {
    return userSnippets.value.length;
  }
});

const userSnippetsLikesCount = computed(() => {
  if (userSnippets.value) {
    return userSnippets.value.reduce((acc, curr) => {
      return acc + curr.likes.length;
    }, 0);
  }
});
</script>

<template>
  <nuxt-layout name="user">
    <div class="flex flex-col items-center justify-center space-y-5">
      <img v-if="user?.image" :src="user.image" class="w-14 h-14 rounded-sm" />
      <div class="flex flex-row items-center justify-center space-x-2">
        <h4 class="text-white/80">
          {{
            user?.name?.toString().slice(0, 4) +
            "..." +
            user?.name?.toString().slice(-4)
          }}
        </h4>
      </div>

      <div
        class="flex flex-row items-center justify-center space-x-4 text-white/50"
      >
        <p>
          {{ userSnippetsCount }}
          {{ userSnippetsCount === 1 ? "Snippet" : "Snippets" }}
        </p>
        <p>
          {{ userSnippetsLikesCount }}
          {{ userSnippetsLikesCount === 1 ? "Like" : "Likes" }}
        </p>
      </div>
    </div>

    <div
      class="h-0.5 w-full md:w-3/4 lg:w-2/3 max-w-xl bg-white/5 rounded-full my-8"
    />

    <div class="w-full flex flex-col items-center justify-center space-y-5">
      <nuxt-link
        v-if="userSnippets && userSnippets?.length > 0"
        v-for="snippet in userSnippets"
        class="snippet-card w-full md:w-3/4 lg:w-2/3 max-w-xl"
        :to="`/snippets/${snippet._id.toString()}`"
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
            class="px-2 py-1 mt-1.5 mr-1.5 bg-white/5 rounded-md text-sm border border-white/10 h-8 w-max"
          >
            {{ tag }}
          </p>
        </div>
        <div class="w-full flex flex-row justify-between items-center">
          <div class="w-full flex flex-row items-center space-x-2">
            <img
              class="h-5 w-5 rounded-full"
              :src="getAvatar(snippet.creator)"
              alt=""
            />
            <p class="text-sm text-white/80">
              {{
                snippet.creator.slice(0, 4) + "..." + snippet.creator.slice(-4)
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
      <div v-else-if="!isValidPubKey">
        <p class="text-white/80 text-center">
          This user doesn't exist (Public Key is invalid). <br />Please check
          the URL.
        </p>
      </div>
      <div v-else>
        <p class="text-white/80">
          No snippets found.
          <nuxt-link
            class="text-primary/80 hover:underline"
            v-if="data!.user?.name === pubKey"
            to="/create"
            >Create one</nuxt-link
          >
        </p>
      </div>
    </div>
  </nuxt-layout>
</template>

<style lang="postcss" scoped>
.snippet-card {
  background: linear-gradient(140deg, #0c0c0c, #000000);
  @apply px-5 py-4 space-y-2 flex flex-col justify-between items-start rounded-2xl border-[1.5px] border-white/10 cursor-pointer transition-all duration-300;
}
.snippet-card:hover {
  @apply border-primary/70;
}
</style>
