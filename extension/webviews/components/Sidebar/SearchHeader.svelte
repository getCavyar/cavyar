<script lang="ts">
  import { debounce } from "../../utils";
  import { isLoading, snippets } from "../../store";
  import { querySnippets, getDiscoverySnippets } from "../../../src/api";

  const debounceSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.trim() === "") {
      isLoading.set(true);
      const { topSnippets, recentSnippets } = await getDiscoverySnippets();
      snippets.set([...topSnippets, ...recentSnippets]);
      isLoading.set(false);
      return;
    }

    try {
      isLoading.set(true);
      const { data } = await querySnippets(searchQuery);
      snippets.set(data);
      isLoading.set(false);
    } catch (error) {
      console.error("Error fetching Snippets", error);
      isLoading.set(true);
      const { topSnippets, recentSnippets } = await getDiscoverySnippets();
      snippets.set([...topSnippets, ...recentSnippets]);
      isLoading.set(false);
    }
  }, 300);

  const handleInput = (e: any) => {
    debounceSearch(e.target.value);
  };
</script>

<input
  type="text"
  placeholder="Search Snippets..."
  on:input={handleInput}
  style="padding: 7px;"
/>
