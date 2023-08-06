<script lang="ts">
  import type { Snippet } from "@/src/types";
  import { onMount } from "svelte";
  import CodeField from "./CodeField.svelte";
  import { generateAvatar, getFrameworkIcon } from "../utils";
  import CalendarIcon from "../icons/CalendarIcon.svelte";
  import PinnedIcon from "../icons/PinnedIcon.svelte";
  import ThumbsUpIcon from "../icons/ThumbsUpIcon.svelte";
  import ThumbsDownIcon from "../icons/ThumbsDownIcon.svelte";
  // import BookmarkIcon from "../icons/BookmarkIcon.svelte";
  import { Circle } from "svelte-loading-spinners";
  import SvelteMarkdown from "svelte-markdown";
  import ClipboardIcon from "../icons/ClipboardIcon.svelte";
  import { pinnedSnippets } from "../store";

  let snippet: Snippet | null = null;

  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const { type, value }: { type: string; value: any } = event.data;
      switch (type) {
        case "setSnippetData":
          snippet = value;
          break;
        case "pinSnippetDetailsView":
          insertSnippet();
          break;
        case "copySnippetDetailsView":
          copySnippet();
          break;
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "Enter":
            insertSnippet();
            break;
          case "c":
            copySnippet();
            break;
        }
      }
    });
  });

  const formatDate = (milliseconds: number) => {
    const date = new Date(milliseconds);
    const options: Intl.DateTimeFormatOptions = {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const insertSnippet = () => {
    if (!snippet || $pinnedSnippets.find((s) => s._id === snippet?._id)) return;
    postMessage({
      type: "pinSnippet",
      value: snippet,
    });
  };

  // const regex = /\${\d+:(.+?)}/g;
  // const prettyCode = (code: string) => {
  //   const matches = code.matchAll(regex);
  //   for (const match of matches) {
  //     code = code.replace(match[0], match[1]);
  //   }
  //   return code;
  // };

  const copySnippet = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
  };
</script>

<div class="center-view">
  <div class="snippet-details-container">
    {#if snippet !== null}
      <div class="left-container">
        <div class="snippet-header">
          <div class="title-container">
            <img
              class="snippet-framework-icon"
              src={getFrameworkIcon(snippet.framework)}
              alt={snippet.framework}
            />
            <h1 class="snippet-title">{snippet.title}</h1>
          </div>

          <div class="snippet-tags-container">
            {#each snippet.tags as tag}
              <p class="snippet-tag">{tag}</p>
            {/each}
          </div>
        </div>

        <p class="snippet-description">{snippet.description}</p>
        <CodeField code={snippet.code} framework={snippet.framework} />

        <div class="ai-container">
          <h2 class="ai-title">AI Generated Description</h2>
          <p class="ai-description">
            CAVYAR AI is still in its earliest stages of development. The AI
            generated description may not be accurate. It will improve massively
            over time.
          </p>

          <div class="ai-answer">
            <SvelteMarkdown
              source={snippet.aiExplanation ??
                "No explanation available at the moment"}
            />
          </div>
        </div>
      </div>

      <div class="right-container">
        <div class="creator-container">
          <img
            class="creator-avatar"
            src={generateAvatar(snippet.creator)}
            alt=""
          />
          <p class="creator-name">
            {snippet.creator.slice(0, 4) + "..." + snippet.creator.slice(-4)}
          </p>
        </div>
        <div class="likes-container">
          <ThumbsUpIcon />
          <p class="likes-count">{snippet.likes?.length ?? 0}</p>
        </div>
        <div class="likes-container">
          <ThumbsDownIcon />
          <p class="likes-count">{snippet.dislikes?.length ?? 0}</p>
        </div>
        <div class="date-container">
          <CalendarIcon />
          <p class="date-text">{formatDate(snippet.createdAt)}</p>
        </div>

        <div
          class="actions-container"
          style="margin-top:1rem; width:100%; display:flex; flex-direction: row;"
        >
          <div class="button-wrapper">
            <button
              class="button-center"
              style="margin-right: 10px"
              on:click={insertSnippet}
            >
              <PinnedIcon />
            </button>
            <p style="font-size: 8px;">CMD + Enter</p>
          </div>

          <div class="button-wrapper">
            <button
              class="button-center"
              style="margin-left: 5px;"
              on:click={copySnippet}
            >
              <ClipboardIcon />
            </button>
            <p style="font-size: 8px;">CMD + C</p>
          </div>

          <!-- <button class="button-center button-deactivated" disabled>
            <BookmarkIcon />
          </button> -->
        </div>
      </div>
    {:else}
      <div class="center-spinner">
        <Circle color="#005d63" size="40" />
      </div>
    {/if}
  </div>
</div>

<svelte:head />

<style scoped>
  .center-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .snippet-details-container {
    max-width: 1000px;
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    height: 100%;
    padding: 1.5rem;
  }

  .snippet-header {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    margin-bottom: 0.5rem;
  }

  .left-container {
    width: calc(100% - 230px);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
  }
  .right-container {
    width: 180px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding: 0.5rem 1rem;
    border-left: 1.5px solid var(--vscode-input-border);
  }
  .title-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
  }
  .snippet-title {
    font-size: 2rem;
    font-weight: 600;
  }
  .snippet-framework-icon {
    width: 1.8rem;
    height: 1.8rem;
    margin-right: 0.7rem;
    border-radius: 100%;
  }
  .snippet-description {
    font-weight: 400;
    margin-bottom: 1.5rem;
  }
  .creator-container {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .creator-avatar {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    margin-right: 0.5rem;
  }
  .creator-name {
    font-weight: 400;
  }
  .likes-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    margin-bottom: 0.5rem;
  }
  .likes-count {
    margin-left: 0.5rem;
    margin-bottom: 0.25px;
  }
  .date-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
  }
  .date-text {
    margin-left: 0.5rem;
    margin-bottom: 0.25px;
  }
  .snippet-tags-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    margin-top: 1rem;
  }
  .snippet-tag {
    margin-right: 5px;
    margin-bottom: 5px;
    padding: 2px 5px;
    border-radius: 2px;
    background-color: var(--vscode-inputOption-activeBackground);
  }

  .ai-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
  }
  .ai-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .ai-description {
    font-weight: 400;
    margin-bottom: 1rem;
    font-size: 12px;
  }
  .ai-answer {
    width: 100%;
    background-color: var(--vscode-tab-inactiveBackground);
    border: 1px solid var(--vscode-menu-border);
    border-radius: 6px;
    padding: 10px;
  }
  /*
  .ai-input-container {
    filter: grayscale(100%);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    width: 100%;
  }
  .ai-input {
    width: 100%;
    height: 2rem;
    border: 0.5px solid var(--vscode-input-border);
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    font-weight: 400;
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
  }
  .ai-input-button {
    width: 6rem;
    margin-left: 0.5rem;
    border-radius: 3px;
  } */

  .button-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
  }

  .button-wrapper > button {
    margin-bottom: 0.5rem;
  }
  .button-wrapper > p {
    font-size: 12px;
    font-weight: 400;
    color: var(--vscode-descriptionForeground);
  }
  .button-center {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .center-spinner {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
