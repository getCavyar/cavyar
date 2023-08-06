import { writable } from "svelte/store";
import type { Snippet } from "@/src/types";

export const snippets = writable<Snippet[]>([]);
export const pinnedSnippets = writable<Snippet[]>([]);
export const isLoading = writable<boolean>(true);
