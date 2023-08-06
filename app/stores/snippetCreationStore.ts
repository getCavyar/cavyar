import { acceptHMRUpdate } from "pinia";
import { useMonaco } from "@guolao/vue-monaco-editor";
import { Range } from "monaco-editor";
import { z } from "zod";
// import { useSelectionMenuStore } from "./selectionMenuStore";
import { SnippetFramework } from "~~/ts/types";
import { frameworks } from "~~/ts/constants";

export enum CreationMode {
  edit = 1,
  select = 2,
  details = 3,
  preview = 4,
}

export const useSnippetCreationStore = defineStore(
  "snippetCreationStore",
  () => {
    // const { isOpen, left, top } = toRefs(useSelectionMenuStore());
    // const mouse = useMouse();

    const { monacoRef, unload } = useMonaco();
    const snippetCode = useState("snippetCode", () => "");

    const initEditor = () => {
      // monacoRef.value?.editor
      //   .getEditors()[0]
      //   .onDidChangeCursorSelection((e) => {
      //     if (e.selection.isEmpty()) {
      //       isOpen.value = false;
      //     } else {
      //       isOpen.value = true;
      //       left.value = mouse.x.value - 40 + "px";
      //       top.value = mouse.y.value - 80 + "px";
      //     }
      //   });

      monacoRef.value?.editor.getEditors()[0]?.onDidChangeModelContent(() => {
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

    const mode = useState<CreationMode>("mode", () => CreationMode.edit);

    const markerGroups = useState<
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

    const selectedMarkerGroup = useState<string | null>(
      "selectedMarkerGroup",
      () => null,
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

    const selectedSnippetFrameworkLanguage = computed(() => {
      return frameworks.find((f) => f.name === snippetFramework.value)
        ?.language;
    });

    const snippetTitle = useState("snippetTitle", () => "");

    const snippetDescription = useState("snippetDescription", () => "");

    const snippetFramework = useState<SnippetFramework>(
      "snippetFramework",
      () => "anchor",
    );

    watch(snippetFramework, () => {
      const model = monacoRef.value?.editor.getEditors()[0]?.getModel();
      if (model) {
        monacoRef.value?.editor!.setModelLanguage(
          model,
          selectedSnippetFrameworkLanguage.value!,
        );
      }
    });

    const snippetTags = useState<string[]>("snippetTags", () => []);

    const tagInput = useState("tagInput", () => "");

    const addTag = (tag: string) => {
      if (
        snippetTags.value.length < 5 &&
        snippetDetailsSchema.tagContent.safeParse(tag).success &&
        !tagExists(tag)
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
          marker.endCol,
        );
      });

      ranges.sort((a, b) => {
        if (a === undefined || b === undefined) return 0;
        if (a.startLineNumber === b.startLineNumber) {
          return a.startColumn - b.startColumn;
        }
        return a.startLineNumber - b.startLineNumber;
      });

      const code = useState(() => editorValue);

      for (let i = ranges.length - 1; i >= 0; i--) {
        if (!ranges[i]) continue;
        const { startColumn, startLineNumber: startRow } = ranges[i];

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
            lineNumber: ranges[i].endLineNumber,
            column: ranges[i].endColumn,
          });

        const markerGroup = markerGroups.value.find((group) =>
          group.markers.some(
            (markerFromGroup) => markerFromGroup.id === markers.value[i].id,
          ),
        );

        const groupName = markerGroup ? markerGroup.name : "default";

        code.value = `${code.value.slice(0, startIndex)}\${${
          i + 1 + ":" + groupName
        }}${code.value.slice(endIndex)}`;
      }

      return code.value;
    };

    const snippetDetailsSchema = {
      code: z.string().min(5).max(3000),
      markerGroups: z
        .array(
          z.object({
            name: z.string().min(1).max(30),
            markers: z
              .array(
                z.object({
                  id: z.string(),
                  startRow: z.number(),
                  startCol: z.number(),
                  endRow: z.number(),
                  endCol: z.number(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
      title: z.string().min(5).max(50),
      description: z.string().min(30).max(1000),
      tags: z.array(z.string().min(2).max(20)).min(2).max(5),
      tagContent: z.string().min(2).max(20),
    };

    const validateCode = computed(() => {
      return snippetDetailsSchema.code.safeParse(snippetCode.value).success;
    });

    const validateMarkerGroups = computed(() => {
      return snippetDetailsSchema.markerGroups.safeParse(markerGroups.value)
        .success;
    });

    const validateTitle = computed(() => {
      return snippetDetailsSchema.title.safeParse(snippetTitle.value).success;
    });

    const validateDescription = computed(() => {
      return snippetDetailsSchema.description.safeParse(
        snippetDescription.value,
      ).success;
    });

    const validateTags = computed(() => {
      return snippetDetailsSchema.tags.safeParse(snippetTags.value).success;
    });

    const validateTagContent = (tag: string) => {
      return z.string().min(2).max(20).safeParse(tag).success;
    };

    const tagExists = (tag: string) => {
      return snippetTags.value.includes(tag);
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
      snippetDetailsSchema,
      validateCode,
      validateMarkerGroups,
      validateTitle,
      validateDescription,
      validateTags,

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
      validateTagContent,
      tagExists,
    };
  },
);

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useSnippetCreationStore, import.meta.hot),
  );
