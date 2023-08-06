<script lang="ts">
  import CloseIcon from "../../icons/CloseIcon.svelte";
  import WandIcon from "../../icons/WandIcon.svelte";
  import { isLoading, pinnedSnippets, snippets } from "@/webviews/store";
  import type { Snippet } from "@/src/types";
  import { Circle } from "svelte-loading-spinners";

  const insertSnippet = (snippet: Snippet) => {
    postMessage({
      type: "insertSnippet",
      value: snippet,
    });
  };
  const unpinSnippet = (snippet: Snippet) => () => {
    pinnedSnippets.set($pinnedSnippets.filter((s) => s._id !== snippet._id));
    console.log("Unpinning snippet", snippet);
    postMessage({
      type: "unpinSnippet",
      value: snippet,
    });
  };

  const openSnippetDetails = (snippet: Snippet) => {
    postMessage(
      {
        type: "openSnippetDetails",
        value: snippet,
      },
      "*"
    );
  };
</script>

<div class="snippets-listview">
  {#each $pinnedSnippets as pinnedSnippet}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="pinned-snippet-card">
      <div class="pinned-snippet-card-leading">
        <div class="close-button" on:click={unpinSnippet(pinnedSnippet)}>
          <CloseIcon />
        </div>
        <p class="pinned-snippet-card-title">
          {pinnedSnippet.title}
        </p>
      </div>

      <div class="insert-button" on:click={() => insertSnippet(pinnedSnippet)}>
        <WandIcon />
      </div>
    </div>
  {/each}

  {#each $snippets as snippet}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="snippet-card" on:click={() => openSnippetDetails(snippet)}>
      <h3 class="snippet-card-title">{snippet.title}</h3>
      <p class="snippet-card-description">{snippet.description}</p>
      <div class="tags-container">
        {#each snippet.tags as tag}
          <div class="tag">{tag}</div>
        {/each}
      </div>
    </div>
  {/each}

  {#if $snippets.length == 0 && $isLoading === false}
    <div class="no-snippets-container">
      <p style="font-size: 50px; margin: 0; color: var(--vscode-foreground);">
        404
      </p>
      <p>No snippets found for your query. Try searching for something else.</p>
    </div>
  {/if}

  {#if $snippets.length === 0 && $isLoading === true}
    <div class="loading-container">
      <Circle color="#005d63" size="40" />
    </div>
  {/if}
</div>

<style scoped>
  .snippets-listview {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: calc(100vh - 90px);
  }
  .pinned-snippet-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 7px 10px;
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-foreground);
    border: 1px solid var(--vscode-button-secondaryBackground);
    margin: 5px 10px;
    border-radius: 3px;
  }
  .pinned-snippet-card-title {
    font-size: 14px;
    margin: 0;
    /* truncate */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pinned-snippet-card-leading {
    width: calc(100% - 30px);
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .close-button {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
    cursor: pointer;
  }
  .close-button:hover {
    background-color: var(--vscode-button-secondaryBackground);
    border-radius: 3px;
  }
  .insert-button {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
    cursor: pointer;
  }
  .insert-button:hover {
    background-color: var(--vscode-button-secondaryBackground);
    border-radius: 3px;
  }
  .snippet-card {
    cursor: pointer;
    padding: 10px;
  }
  .snippet-card-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .snippet-card-description {
    color: var(--vscode-foreground);

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .snippet-card:hover {
    background-color: var(--vscode-editorHoverWidget-background);
  }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .tag {
    margin-right: 5px;
    margin-bottom: 5px;
    padding: 2px 5px;
    border-radius: 2px;
    background-color: var(--vscode-inputOption-activeBackground);
  }

  .no-snippets-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 200px);
    text-align: center;
    padding: 10px 20px;
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 200px);
  }
</style>
