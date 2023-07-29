<!-- <script setup lang="ts">
import { storeToRefs } from "pinia";
import { Range } from "ace-builds";
import { VAceEditor } from "vue3-ace-editor";
import { VAceEditorInstance } from "vue3-ace-editor/types";
import { useSelectionMenuStore } from "~~/stores/selectionMenuStore";
import {
  CreationMode,
  useSnippetCreationStore,
} from "~~/stores/snippetCreationStore";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "update:modelValue", ...args: any[]): void;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newVal: string) {
    emit("update:modelValue", newVal);
  },
});

const { markerGroups, mode, editor, selectedSnippetFrameworkLanguage } =
  storeToRefs(useSnippetCreationStore());

const editorInit = (initEditor: VAceEditorInstance) => {
  // if already initialized return
  if (editor.value) return;

  // if not initialized, initialize
  editor.value = initEditor;

  if (!editor.value) {
    alert("EDITOR NOT INITIALIZED");
    return;
  }
  // editor.value._editor.setHighlightActiveLine(false);
  // editor.value._editor.on("change", () => {
  //   TODO update marker positions on change
  // });
  markerGroups.value.forEach((group) => {
    // Restore classes
    const style = document.createElement("style");
    style.innerHTML = `#${group.id} { color: ${group.color}; }`;
    style.innerHTML = `.${group.id} { background-color: ${group.color}70; position: absolute; z-index: 100; }`;
    document.getElementsByTagName("head")[0].appendChild(style);
    group.markers.forEach((marker) => {
      editor.value?._editor.session.addMarker(
        new Range(
          marker.startRow,
          marker.startCol,
          marker.endRow,
          marker.endCol
        ),
        markerGroups.value.filter((group) =>
          group.markers.some(
            (markerFromGroup) => markerFromGroup.id === marker.id
          )
        )[0].id,
        "text",
        true
      );
    });
  });
};

const cursorColor = computed(() => {
  if (mode.value !== CreationMode.edit) return "transparent";
  return "#00ffaa";
});
const activeLineColor = computed(() => {
  if (mode.value !== CreationMode.edit) return "transparent";
  return "rgba(255 ,255 ,255 ,0.1)";
});

const { left, top, isOpen } = storeToRefs(useSelectionMenuStore());

const handleClick = (event: MouseEvent) => {
  if (mode.value !== CreationMode.select) return;
  const selection = window.getSelection();
  if (!selection) return;
  if (selection.toString().length > 0) {
    // cursor position
    left.value = event.clientX - 40 + "px";
    top.value = event.clientY - 80 + "px";
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
};

const aceRef = ref();

onMounted(() => {
  editorInit(aceRef.value);
});

const editorInit2 = (x: any) => {
  console.log("X: ", x);
};
</script>

<template>
  {{ aceRef }}
  <VAceEditor
    ref="aceRef"
    v-model:value="value"
    :lang="selectedSnippetFrameworkLanguage"
    :readonly="readOnly"
    theme="monokai"
    :wrap="true"
    style="
      height: 100%;
      font-size: 21px;
      line-height: 30px;
      background-color: transparent;
      color: rgba(255, 255, 255, 0.85);
    "
    @init="editorInit2"
    @click="handleClick"
  />
</template>

<style>
.ace-monokai .ace_gutter {
  background-color: transparent !important;
}
.ace_cursor {
  color: v-bind(cursorColor) !important;
}
.ace_active-line {
  background-color: v-bind(activeLineColor) !important;
}
.ace_gutter-active-line {
  background-color: v-bind(activeLineColor) !important;
}
</style> -->
