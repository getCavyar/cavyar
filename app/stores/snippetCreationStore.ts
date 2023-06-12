import { acceptHMRUpdate } from "pinia";
import { VAceEditorInstance } from "vue3-ace-editor/types";
import { SnippetFramework } from "~~/ts/types";

export enum CreationMode {
  edit = 1,
  select = 2,
  details = 3,
  preview = 4,
}

export const useSnippetCreationStore = defineStore(
  "snippetCreationStore",
  () => {
    const editor = useState<VAceEditorInstance | null>("editor", () => null);

    const codeEditorValue = useSessionStorage("code", () => "");

    const mode = useSessionStorage<CreationMode>(
      "mode",
      () => CreationMode.edit
    );

    const markerGroups = useSessionStorage<
      {
        id: string;
        color: string;
        name: string;
        markers: {
          id: number;
          startRow: number;
          startCol: number;
          endRow: number;
          endCol: number;
        }[];
      }[]
    >("markerGroups", () => []);

    const markers = computed(() => {
      return markerGroups.value.map((group) => group.markers).flat();
    });

    const selectedMarkerGroup = useSessionStorage<string | null>(
      "selectedMarkerGroup",
      () => null
    );

    const createMarkerGroupClass = (id: string) => {
      const color = getRandomColor();
      // create a new class
      var style = document.createElement("style");
      style.innerHTML = `#${id} { color: ${color}; }`;
      style.innerHTML = `.${id} { background-color: ${color}70; position: absolute; z-index: 100; }`;
      document.getElementsByTagName("head")[0].appendChild(style);
    };

    const selectMarkerGroup = (id: string) => {
      selectedMarkerGroup.value = id;
    };

    const getRandomColor = () => {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    const deleteAllMarkers = () => {
      markerGroups.value = [];
      // Ace won't update the markers if we don't reload the page
      // So we reload the page for now (God forgive me)
      window.location.reload();
    };

    const frameworks = useState<
      { name: SnippetFramework; language: string; icon: string }[]
    >(() => [
      {
        name: "anchor" as SnippetFramework,
        language: "rust",
        icon: "https://www.anchor-lang.com/_next/image?url=%2Flogo.png&w=64&q=75",
      },
      {
        name: "native" as SnippetFramework,
        language: "rust",
        icon: "https://pbs.twimg.com/profile_images/1365435380758163456/MwryCZuw_400x400.png",
      },
      {
        name: "seahorse" as SnippetFramework,
        language: "python",
        icon: "https://pbs.twimg.com/profile_images/1556384244598964226/S3cx06I2_400x400.jpg",
      },
      {
        name: "typescript" as SnippetFramework,
        language: "typescript",
        icon: "https://cdn-icons-png.flaticon.com/512/5968/5968381.png",
      },
    ]);

    const selectedSnippetFrameworkLanguage = computed(() => {
      return frameworks.value.find((f) => f.name === snippetFramework.value)
        ?.language;
    });

    const snippetTitle = useSessionStorage("snippetTitle", () => "");

    const snippetDescription = useSessionStorage(
      "snippetDescription",
      () => ""
    );

    const snippetFramework = useSessionStorage<SnippetFramework>(
      "snippetFramework",
      () => "anchor"
    );

    const snippetTags = useSessionStorage<string[]>("snippetTags", () => []);

    const tagInput = useSessionStorage("tagInput", () => "");

    const addTag = (tag: string) => {
      if (
        !snippetTags.value.includes(tag) &&
        snippetTags.value.length <= 4 &&
        tag.length > 0
      ) {
        snippetTags.value.push(tag);
        tagInput.value = "";
      }
    };

    const deleteTag = (tag: string) => {
      snippetTags.value = snippetTags.value.filter((t) => t !== tag);
    };

    return {
      editor,
      codeEditorValue,
      mode,
      markerGroups,
      markers,
      selectedMarkerGroup,
      frameworks,
      snippetTitle,
      snippetDescription,
      snippetFramework,
      snippetTags,
      tagInput,
      selectedSnippetFrameworkLanguage,

      getRandomColor,
      createMarkerGroupClass,
      selectMarkerGroup,
      deleteAllMarkers,
      addTag,
      deleteTag,
    };
  }
);

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useSnippetCreationStore, import.meta.hot)
  );
