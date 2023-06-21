<template>
  <div class="relative">
    <lazy-wallet-dialog />
    <lazy-reusable-dialog />
    <dynamic-appbar />
    <NuxtPage />
  </div>
</template>

<style lang="postcss">
html {
  @apply font-montserrat text-white bg-black;
  background: linear-gradient(150deg, #021215, #000000 76%) no-repeat;
  background-color: #000000;
  min-height: 100vh;
  width: 100vw;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  filter: blur(0);
}
</style>
