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
      case "insertSnippet": {
        vscode.postMessage({
          type: "insertSnippet",
          value: value,
        });
        break;
      }
    }
  });
})();
