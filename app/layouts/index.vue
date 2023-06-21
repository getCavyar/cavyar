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
        <slot name="content" />
      </div>
    </div>

    <div class="overflow-hidden">
      <div
        class="mt-[100vh] relative min-h-screen bg-black/80 backdrop-blur-2xl z-30 pt-10"
        style="box-shadow: 0px -10px 20px rgba(0, 0, 0, 0.3)"
      >
        <div
          v-for="category in ['popular', 'recent']"
          :key="category"
          class="space-y-3 flex flex-col p-10"
        >
          <div class="flex flex-row items-center justify-center space-x-5">
            <div class="w-full h-0.5 bg-white/10" />
            <h3 class="text-center">{{ category.toUpperCase() }}</h3>
            <div class="w-full h-0.5 bg-white/10" />
          </div>
          <div class="flex justify-center items-center">
            <div
              class="max-w-7xl flex flex-row flex-wrap items-center justify-center"
            >
              <slot :name="category" />
            </div>
          </div>
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
