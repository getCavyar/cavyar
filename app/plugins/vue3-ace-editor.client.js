import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

import ace from "ace-builds";

import modeRustUrl from "ace-builds/src-noconflict/mode-rust?url";
ace.config.setModuleUrl("ace/mode/rust", modeRustUrl);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("ace-editor", VAceEditor);
});
