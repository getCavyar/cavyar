<script lang="ts">
  import { navigate } from "svelte-navigator";

  export let setSelectedTab: (tab: string) => void;
  export let selectedTab: string;
</script>

<div class="tabbar">
  <button
    class={selectedTab == "Search" ? "selected-tab" : "tab"}
    on:click={() => {
      setSelectedTab("Search");
      navigate("/search");
    }}
  >
    Search
  </button>
  <button
    class={selectedTab == "Bookmarks" ? "selected-tab" : "tab"}
    on:click={() => {
      setSelectedTab("Bookmarks");
      navigate("/bookmarks");
    }}
  >
    Bookmarks
  </button>
</div>

<style scoped>
  .tabbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .tabbar button:first-child {
    margin-right: 3px;
  }
  .tabbar button:last-child {
    margin-left: 3px;
  }
  .tab {
    border: none;
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
    width: 100%;
    text-align: center;
    outline: 1px solid transparent;
    outline-offset: 2px !important;
    color: var(--vscode-button-foreground);
    background: var(--vscode-button-secondaryBackground);
  }
  .selected-tab {
    border: none;
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
    width: 100%;
    text-align: center;
    outline: 1px solid transparent;
    outline-offset: 2px !important;
    color: var(--vscode-button-foreground);
    background: var(--vscode-button-background);
  }
</style>
