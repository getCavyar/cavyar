<script setup lang="ts">
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

<template>
  <div class="w-screen relative flex flex-col">
    <div class="relative">
      <div
        ref="scrollDarkOverlay"
        class="w-screen h-screen bg-black z-20 absolute pointer-events-none"
      ></div>
      <div
        ref="scrollBlurOverlay"
        class="w-screen h-screen backdrop-blur-2xl z-10 absolute pointer-events-none"
      ></div>
      <div
        class="radial-gradient pb-5 h-screen w-screen fixed z-0 flex flex-col items-center justify-center space-y-8"
      >
        <img src="@/assets/images/logo_white.png" class="h-12" />
        <div class="w-1/2 h-16 relative flex items-center justify-center group">
          <input
            class="w-full h-full pl-16 py-1 px-4 text-white text-lg font-medium bg-black/60 backdrop-blur-2xl rounded-xl shadow-xl shadow-black/40 border border-transparent hover:border-primary focus:border-primary transition-all duration-500"
            placeholder="PDA Signer Anchor..."
          />
          <icon
            name="line-md:search"
            size="1.4em"
            class="mb-0.5 absolute left-5 text-white group-hover:text-primary transition-all duration-500"
          />
        </div>
      </div>
    </div>

    <div
      class="mt-[100vh] min-h-screen py-20 bg-black/80 backdrop-blur-2xl z-30"
      style="box-shadow: 0px -10px 20px rgba(0, 0, 0, 0.3)"
    >
      <div class="space-y-3 flex flex-col">
        <h3 class="w-fit pl-6">Trending</h3>
        <div class="px-6 w-full space-x-8 flex flex-row overflow-auto">
          <slot name="trending" />
        </div>
      </div>
      <div class="h-20"></div>
      <div class="space-y-3 flex flex-col">
        <h3 class="w-fit pl-6">Recent</h3>
        <div class="px-6 w-full space-x-8 flex flex-row overflow-auto">
          <slot name="recent" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.radial-gradient {
  background: radial-gradient(
    ellipse at top,
    rgba(var(--primary), 0.3) 0%,
    black 75%
  );
}
</style>
