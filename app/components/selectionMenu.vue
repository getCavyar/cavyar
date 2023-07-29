<script setup lang="ts">
import { Range } from "monaco-editor";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useSelectionMenuStore } from "~~/stores/selectionMenuStore";
import { useSnippetCreationStore } from "~~/stores/snippetCreationStore";

const { isOpen, left, top } = storeToRefs(useSelectionMenuStore());

const snippetCreationStore = useSnippetCreationStore();
const { monacoRef, markerGroups, markers, selectedMarkerGroup } =
  storeToRefs(snippetCreationStore);

const addMarker = () => {
  try {
    const editor = monacoRef.value!.editor.getEditors()[0];
    const selection = editor.getSelection()!;

    const selectionRange = new Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
    );

    // check if there is a marker inside the range
    const isMarkInRangeAlready = Object.values(markers.value)
      .map((marker) => {
        return (
          selection.intersectRanges(
            new Range(
              marker.startRow,
              marker.startCol,
              marker.endRow,
              marker.endCol
            )
          ) !== null
        );
      })
      .includes(true);

    if (isMarkInRangeAlready) return;

    const styleId = `style-${uuidv4()}`;

    editor.createDecorationsCollection([
      {
        range: selectionRange,
        options: { inlineClassName: styleId },
      },
    ]);

    const id = editor.getModel()!.getDecorationsInRange(selectionRange)[0].id;

    const group = markerGroups.value.filter((group) => {
      return group.id === selectedMarkerGroup.value;
    })[0];

    console.log({ group });

    if (!group) return;
    group.markers.push({
      id,
      styleId,
      startRow: selectionRange.startLineNumber,
      startCol: selectionRange.startColumn,
      endRow: selectionRange.endLineNumber,
      endCol: selectionRange.endColumn,
    });

    const style = document.createElement("style");
    style.innerHTML = `#${styleId} { color: ${group.color}; }`;
    style.innerHTML = `.${styleId} { background-color: ${group.color}70;}`;
    document.getElementsByTagName("head")[0].appendChild(style);
  } catch (e) {
    console.log(e);
  }
};

const removeMarker = () => {
  const editor = monacoRef.value!.editor.getEditors()[0];
  const selection = editor.getSelection()!;

  const selectionRange = new Range(
    selection.startLineNumber,
    selection.startColumn,
    selection.endLineNumber,
    selection.endColumn
  );

  const decorationsInRange = editor
    .getModel()!
    .getDecorationsInRange(selectionRange);

  console.log({ decorationsInRange });

  editor.removeDecorations(
    decorationsInRange.map((decoration) => {
      // remove all markers from markerGroups where the id is the same as the decoration id
      markerGroups.value.forEach((group) => {
        group.markers = group.markers.filter(
          (marker) => marker.id !== decoration.id
        );
      });

      return decoration.id;
    })
  );
};
</script>

<template>
  <transition name="blur-left">
    <div v-if="isOpen" class="menu">
      <button class="px-4 py-1 rounded-l-full" @click="addMarker">
        <icon name="mdi:marker" size="1.2em" class="text-primary" />
      </button>
      <button class="px-4 py-1 rounded-r-full" @click="removeMarker">
        <icon name="mdi:marker-cancel" size="1.2em" class="text-red-700" />
      </button>
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.menu {
  @apply absolute z-10 flex flex-row border-primary border rounded-full font-montserrat font-medium p-2 backdrop-blur-2xl bg-black/50;
  box-shadow: 0px 0px 20px 10px rgba(0, 0, 0, 0.5);
  left: v-bind(left);
  top: v-bind(top);
}
</style>
