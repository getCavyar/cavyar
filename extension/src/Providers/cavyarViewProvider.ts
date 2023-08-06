import { getNonce } from "../utils";
import * as vscode from "vscode";

export class CavyarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "cavyar-vscode.view";
  private snippetDetailsMap: Map<string, vscode.WebviewPanel> = new Map();

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        webviewView.webview.postMessage({
          type: "initialize",
          value: stateManager(this._context).read().pinnedSnippets,
        });
      }
    });

    webviewView.webview.onDidReceiveMessage(async (data) => {
      const { type, value } = data;
      switch (type) {
        case "openSnippetDetails": {
          const snippetId = value._id; // Assuming there's a unique identifier for snippets, use it as the key
          let panel = this.snippetDetailsMap.get(snippetId);

          if (!panel) {
            // Create and show a new webview
            panel = vscode.window.createWebviewPanel(
              "snippetDetails",
              `${value.title}`,

              vscode.ViewColumn.One,
              {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this._extensionUri],
              }
            );
            panel.iconPath = vscode.Uri.joinPath(
              this._extensionUri,
              "media",
              "icon-colored.png"
            );
            // Save the panel reference to the map
            this.snippetDetailsMap.set(snippetId, panel);

            // Set the webview's initial html content
            panel.webview.html = this._getSnippetDetailsHtmlForWebview(
              panel.webview
            );

            // Set the snippet data in the webview
            panel.webview.postMessage({ type: "setSnippetData", value: value });

            // Listen for messages from the webview
            panel.webview.onDidReceiveMessage(async (data) => {
              const { type, value } = data;
              switch (type) {
                case "pinSnippet": {
                  const state = stateManager(this._context);
                  const { pinnedSnippets } = state.read();

                  if (
                    pinnedSnippets.find((snippet) => snippet._id === value._id)
                  ) {
                    return;
                  }

                  await state.write({
                    pinnedSnippets: [...pinnedSnippets, value],
                  });

                  webviewView.webview.postMessage({
                    type: "pinSnippetSidebar",
                    value: value,
                  });
                  break;
                }
              }
            });

            // Dispose the panel when it is closed to keep the map clean
            panel.onDidDispose(() => {
              this.snippetDetailsMap.delete(snippetId);
            });
          } else {
            // If we already have a panel, show it in the target column
            panel.reveal(vscode.ViewColumn.One);
          }
          break;
        }
        case "insertSnippet": {
          // Insert the snippet into the active editor
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(value.code)
          );
          break;
        }
        case "pinSnippet": {
          console.log("MADE IT FAR 2");
          const state = stateManager(this._context);
          const { pinnedSnippets } = state.read();

          await state.write({
            pinnedSnippets: [...pinnedSnippets, value],
          });
          break;
        }
        case "unpinSnippet": {
          console.log("Got here!");
          const state = stateManager(this._context);
          const { pinnedSnippets } = state.read();
          console.log(state.read());

          await state.write({
            pinnedSnippets: pinnedSnippets.filter(
              (snippet: any) => snippet._id !== value._id
            ),
          });
          break;
        }
        case "pinSnippetShortcut": {
          this.snippetDetailsMap.forEach((panel) => {
            if (panel.visible) {
              panel.webview.postMessage({ type: "pinSnippetDetailsView" });
            }
          });
        }
        case "copySnippetShortcut": {
          this.snippetDetailsMap.forEach((panel) => {
            if (panel.visible) {
              panel.webview.postMessage({ type: "copySnippetDetailsView" });
            }
          });
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "sidebar.js")
    );
    const mediaScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "sidebar.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src * data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src 'self' http: https: ws: vscode-webview:;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        </head>
        <body>
        <script nonce="${nonce}" src="${mediaScriptUri}" type="module"></script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>`;
  }

  private _getSnippetDetailsHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "out",
        "compiled",
        "snippetDetails.js"
      )
    );
    const mediaScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "out",
        "compiled",
        "snippetDetails.css"
      )
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
          -->
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https: data: https://cavyar.fly.dev; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' ${webview.cspSource}; font-src vscode-resource: https: data:; connect-src 'self' https://cavyar.fly.dev;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleMainUri}" rel="stylesheet">
          </head>
          <body>
          <script nonce="${nonce}" src="${mediaScriptUri}" type="module"></script>
          <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>  
        </html>`;
  }
}

function stateManager(context: vscode.ExtensionContext) {
  console.log("STATE MANAGER", context);
  return {
    read,
    write,
  };

  function read(): {
    pinnedSnippets: any[];
  } {
    return {
      pinnedSnippets: context.globalState.get("pinnedSnippets") || [],
    };
  }

  async function write(newState: any) {
    await context.globalState.update("pinnedSnippets", newState.pinnedSnippets);
  }
}
