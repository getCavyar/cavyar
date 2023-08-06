<template>
  <div class="w-full py-16 relative flex items-start justify-center">
    <div class="max-w-7xl">
      <div class="pt-5 flex flex-row space-x-14">
        <main class="space-y-3 flex flex-col items-start justify-start">
          <slot />
        </main>

        <div class="w-80 h-32 sticky top-8 space-y-8">
          <slot name="side" />
        </div>
      </div>
    </div>
  </div>
</template>
