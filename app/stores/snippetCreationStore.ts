import { acceptHMRUpdate } from "pinia";
import { useSelectionMenuStore } from "./selectionMenuStore";
import { SnippetFramework } from "~~/ts/types";
import { useMonaco } from "@guolao/vue-monaco-editor";
import { Range } from "ace-builds";

export enum CreationMode {
  edit = 1,
  select = 2,
  details = 3,
  preview = 4,
}

export const useSnippetCreationStore = defineStore(
  "snippetCreationStore",
  () => {
    const { isOpen, left, top } = toRefs(useSelectionMenuStore());
    const mouse = useMouse();

    const { monacoRef, unload } = useMonaco();
    // const language = useSessionStorage("language", () => "html");
    // const readOnly = useSessionStorage("readOnly", () => false);
    const snippetCode = useSessionStorage("snippetCode", () => "");

    const initEditor = () => {
      monacoRef.value?.editor
        .getEditors()[0]
        .onDidChangeCursorSelection((e) => {
          if (e.selection.isEmpty()) {
            isOpen.value = false;
          } else {
            isOpen.value = true;
            left.value = mouse.x.value - 40 + "px";
            top.value = mouse.y.value - 80 + "px";
          }
        });

      monacoRef.value?.editor.getEditors()[0].onDidChangeModelContent(() => {
        snippetCode.value = getEditorValue();
      });
    };

    const getEditorValue = () => {
      return (
        monacoRef.value?.editor?.getEditors()[0]?.getModel()?.getValue() ?? ""
      );
    };

    const setEditorValue = (value: string) => {
      monacoRef.value?.editor?.getEditors()[0]?.getModel()?.setValue(value);
    };

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
          id: string;
          styleId: string;
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
      const style = document.createElement("style");
      style.innerHTML = `#${id} { color: ${color}; }`;
      style.innerHTML = `.${id} { background-color: ${color}70; position: absolute; z-index: 100; }`;
      document.getElementsByTagName("head")[0].appendChild(style);
    };

    const selectMarkerGroup = (id: string) => {
      selectedMarkerGroup.value = id;
    };

    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    const deleteAllMarkers = () => {
      markerGroups.value = [];
      // Ace won't update the markers if we don't reload the page
      // So we reload the page for now (God forgive me)
      // window.location.reload();
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

    watch(snippetFramework, (newVal) => {
      monacoRef.value?.editor!.setModelLanguage(
        monacoRef.value?.editor!.getEditors()[0].getModel()!,
        selectedSnippetFrameworkLanguage.value!
      );
    });

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

    const getSnippetCode = (editorValue: string) => {
      const ranges = markers.value.map((marker) => {
        return new Range(
          marker.startRow,
          marker.startCol,
          marker.endRow,
          marker.endCol
        );
      });

      ranges.sort((a, b) => {
        if (a === undefined || b === undefined) return 0;
        if (a?.start.row === b?.start.row) {
          return a.start.column - b.start.column;
        }
        return a.start.row - b.start.row;
      });

      const code = useState(() => editorValue);
      for (let i = ranges.length - 1; i >= 0; i--) {
        if (!ranges[i]) continue;
        const {
          start: { column: startColumn, row: startRow },
        } = ranges[i]!;

        const startIndex = monacoRef
          .value!.editor.getEditors()[0]
          .getModel()!
          .getOffsetAt({
            lineNumber: startRow,
            column: startColumn,
          });
        const endIndex = monacoRef
          .value!.editor.getEditors()[0]
          .getModel()!
          .getOffsetAt({
            lineNumber: ranges[i]!.end.row,
            column: ranges[i]!.end.column,
          });

        const markerGroup = markerGroups.value.filter((group) =>
          group.markers.some(
            (markerFromGroup) => markerFromGroup.id === markers.value[i].id
          )
        )[0];

        const groupName = markerGroup ? markerGroup.name : "default";

        code.value = `${code.value.slice(0, startIndex)}\${${
          i + 1 + ":" + groupName
        }}${code.value.slice(endIndex)}`;
      }
      return code.value;
    };

    return {
      monacoRef,
      snippetCode,
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

      initEditor,
      getEditorValue,
      setEditorValue,
      unload,
      getRandomColor,
      createMarkerGroupClass,
      selectMarkerGroup,
      deleteAllMarkers,
      addTag,
      deleteTag,
      getSnippetCode,
    };
  }
);

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useSnippetCreationStore, import.meta.hot)
  );
