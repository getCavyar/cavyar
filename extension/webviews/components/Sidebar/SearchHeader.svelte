<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { frameworks, getFrameworkIcon } from "../../utils";

  let searchQuery = "";
  let selectedFramework = "anchor";
  let showFrameworkPicker = false;
</script>

<!-- Framework Selector Backdrop -->
{#if showFrameworkPicker == true}
  <!-- backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    transition:fade
    class="backdrop"
    on:click={() => {
      showFrameworkPicker = false;
    }}
  />
{/if}

<div
  style="display:flex; flex-direction: row; align-items: center; justify-items: center; position: relative;"
>
  <input
    style="margin-right:10px"
    placeholder="Search Snippets..."
    bind:value={searchQuery}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    style="display:flex; flex-direction: column; align-items: center; justify-items: center; position: relative; z-index: 2;"
    on:click={() => {
      showFrameworkPicker = !showFrameworkPicker;
    }}
  >
    <img
      style="width: 28px; height: 25px; object-fit: cover; border-radius: 9999px; filter: brightness(0.8)"
      src={getFrameworkIcon(selectedFramework)}
      alt={selectedFramework}
    />
    {#if showFrameworkPicker == true}
      <div
        transition:fly={{ duration: 300 }}
        style="width: 28px; display: flex; flex-direction: column; justify-items: center; align-items: center; position: absolute; top: 30px; right: -5; border-radius: 9999px; padding: 2px"
      >
        <!-- show the frameworks that are not selected -->
        {#each Object.keys(frameworks) as framework}
          {#if framework != selectedFramework}
            <img
              on:click={() => (selectedFramework = framework)}
              style="object-fit: contain; border-radius: 9999px; margin: 3px 0; box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);"
              src={getFrameworkIcon(framework)}
              alt={framework}
            />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style scoped>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
  /* TODO Move inline CSS here */
</style>
