<script lang="ts">
  import { navigate, Route, Router } from "svelte-navigator";
  import { writable } from "svelte/store";
  import { onMount } from "svelte/internal";
  import type { Snippet } from "../../types";
  import SearchView from "./SearchView.svelte";
  import SearchHeader from "./SearchHeader.svelte";
  import Tabbar from "./Tabbar.svelte";

  export let snippets: Snippet[] = [];

  const selectedTab = writable("Zaps");
  let pinnedSnippets: Snippet[] = [];

  const pinSnippet = (snippet: Snippet) => {
    pinnedSnippets = [...pinnedSnippets, snippet];
  };

  const fetchSnippets = async (query?: string) => {
    if (query) {
      const response = await fetch(
        `http://localhost:3000/api/snippets?query=${query}`
      );
      const { data } = await response.json();
      console.log("DATA", data);
      return data;
    } else {
      const response = await fetch("http://localhost:3000/api/snippets");
      const { data } = await response.json();
      console.log("DATA", data);
      return data;
    }
  };

  onMount(async () => {
    navigate("/zaps");
    window.addEventListener("message", (event) => {
      const { type, value } = event.data;
      switch (type) {
        case "pinSnippet":
          pinSnippet(value);
          break;
      }
    });
    snippets = await fetchSnippets();
  });
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
      <SearchView {pinnedSnippets} {snippets} />
    </Route>

    <Route path="zaps">
      <div class="" />
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
</style>
