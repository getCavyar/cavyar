import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

import ace from "ace-builds";

import modeRustUrl from "ace-builds/src-noconflict/mode-rust?url";
import modeTypescriptUrl from "ace-builds/src-noconflict/mode-typescript?url";
import modePythonUrl from "ace-builds/src-noconflict/mode-python?url";

export default defineNuxtPlugin((nuxtApp) => {
  ace.config.setModuleUrl("ace/mode/python", modePythonUrl);
  ace.config.setModuleUrl("ace/mode/rust", modeRustUrl);
  ace.config.setModuleUrl("ace/mode/typescript", modeTypescriptUrl);
  nuxtApp.vueApp.component("ace-editor", VAceEditor);
});
