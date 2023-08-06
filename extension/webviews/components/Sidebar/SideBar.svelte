<script lang="ts">
  import { navigate, Route, Router } from "svelte-navigator";
  import { writable } from "svelte/store";
  import { onMount } from "svelte/internal";
  import SearchView from "./SearchView.svelte";
  import SearchHeader from "./SearchHeader.svelte";
  import Tabbar from "./Tabbar.svelte";
  import type { Snippet } from "@/src/types";
  import { snippets, pinnedSnippets } from "@/webviews/store";
  import { getDiscoverySnippets } from "@/src/api";

  onMount(async () => {
    window.addEventListener("message", (event) => {
      const { type, value } = event.data;
      switch (type) {
        case "initialize":
          console.log("Initializing snippet details", value);
          pinnedSnippets.set(value);
          break;
        case "pinSnippetSidebar":
          pinSnippet(value);
          break;
      }

      window.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case "Enter":
              postMessage({
                type: "pinSnippetShortcut",
              });
              break;
            case "c":
              postMessage({
                type: "copySnippetShortcut",
              });
              break;
          }
        }
      });
    });
    navigate("/search");
    const { topSnippets, recentSnippets } = await getDiscoverySnippets();
    snippets.set([...topSnippets, ...recentSnippets]);
  });

  const selectedTab = writable("Search");

  const pinSnippet = (snippet: Snippet) => {
    if ($pinnedSnippets.find((s) => s._id === snippet._id)) return;
    // This is only there to update the svelte store, so that the UI updates
    // It should not update the vscode state, as that is handled by the details webview
    pinnedSnippets.set([...$pinnedSnippets, snippet]);
    console.log("Pinning snippet", $pinnedSnippets);
  };
</script>

<Router primary={false}>
  <div class="sidebar-container">
    <div class="toolbar-container">
      <Tabbar
        setSelectedTab={(tab) => ($selectedTab = tab)}
        selectedTab={$selectedTab}
      />

      {#if $selectedTab == "Search"}
        <SearchHeader
          on:query={async (query) => {
            snippets = await fetchSnippets(
              query.detail ? query.detail : undefined
            );
          }}
        />
      {/if}
    </div>

    <Route path="search">
      <SearchView />
    </Route>

    <Route path="bookmarks">
      <div class="soon-tm">Soon™</div>
    </Route>
  </div>
</Router>

<style scoped>
  .sidebar-container {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
  .toolbar-container {
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    padding-right: 15px;
    padding-bottom: 10px;
    padding-top: 3px;
  }
  .soon-tm {
    height: calc(100vh - 200px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    color: var(--vscode-foreground);
  }
</style>
