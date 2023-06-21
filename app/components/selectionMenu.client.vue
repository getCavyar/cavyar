<script setup lang="ts">
import { Range } from "ace-builds";
import { storeToRefs } from "pinia";
import { useSelectionMenuStore } from "~~/stores/selectionMenuStore";
import { useSnippetCreationStore } from "~~/stores/snippetCreationStore";

const { isOpen, left, top } = storeToRefs(useSelectionMenuStore());

const snippetCreationStore = useSnippetCreationStore();
const { markerGroups, markers, selectedMarkerGroup, editor } =
  storeToRefs(snippetCreationStore);

const addMarker = () => {
  if (!editor.value) return;

  const range = editor.value._editor.selection.getRange();

  // check if there is a marker inside the range
  const isMarkInRangeAlready = Object.values(markers.value)
    .map((marker) => {
      return new Range(
        marker.startRow,
        marker.startCol,
        marker.endRow,
        marker.endCol
      ).intersects(range);
    })
    .includes(true);

  if (isMarkInRangeAlready) return;

  const id = editor.value._editor.session.addMarker(
    range,
    snippetCreationStore.selectedMarkerGroup!,
    "text",
    true
  );
  const group = markerGroups.value.filter((group) => {
    return group.id === selectedMarkerGroup.value;
  })[0];

  if (!group) return;

  group.markers.push({
    id,
    startRow: range.start.row,
    startCol: range.start.column,
    endRow: range.end.row,
    endCol: range.end.column,
  });

  const style = document.createElement("style");
  style.innerHTML = `#${group.id} { color: ${group.color}; }`;
  style.innerHTML = `.${group.id} { background-color: ${group.color}70; position: absolute; z-index: 100; }`;
  document.getElementsByTagName("head")[0].appendChild(style);
};

const removeMarker = () => {
  if (!editor.value) return;

  const removeRange = editor.value._editor.selection.getRange();

  const markerToDelete = Object.entries(markers.value).find(([, value]) => {
    const range = new Range(
      value.startRow,
      value.startCol,
      value.endRow,
      value.endCol
    );
    return range.toString() === removeRange.toString();
  });
  if (markerToDelete === undefined) return;

  const id = markerToDelete[1].id;
  editor.value._editor.session.removeMarker(id);
  // TODO Find a better way to remove the markers asap when I got time.
  // God forgive me for this.
  window.location.reload();

  markerGroups.value.forEach((group) => {
    group.markers = group.markers.filter(
      (marker) => marker.id !== markerToDelete[1].id
    );
  });

  // if this was the only marker from group, remove the group
  markerGroups.value = markerGroups.value.filter((group) => {
    return group.markers.length > 0;
  });
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
