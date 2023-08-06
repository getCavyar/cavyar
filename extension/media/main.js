(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener("message", (event) => {
    const { type, value } = event.data;
    switch (type) {
      case "openSnippetDetails": {
        vscode.postMessage({
          type: "openSnippetDetails",
          value: value,
        });
        break;
      }
      case "pinSnippet": {
        vscode.postMessage({
          type: "pinSnippet",
          value: value,
        });
        break;
      }
      case "unpinSnippet": {
        vscode.postMessage({
          type: "unpinSnippet",
          value: value,
        });
        break;
      }
      case "insertSnippet": {
        vscode.postMessage({
          type: "insertSnippet",
          value: value,
        });
        break;
      }
      case "pinSnippetShortcut": {
        vscode.postMessage({
          type: "pinSnippetShortcut",
          value: value,
        });
        break;
      }
      case "copySnippetShortcut": {
        vscode.postMessage({
          type: "copySnippetShortcut",
          value: value,
        });
        break;
      }
    }
  });
})();
