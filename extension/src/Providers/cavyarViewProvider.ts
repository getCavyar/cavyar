import { getNonce } from "../utils";
import * as vscode from "vscode";

export class CavyarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "cavyar-vscode.view";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      const { type, value } = data;
      switch (type) {
        case "openSnippetDetails": {
          const panel = vscode.window.createWebviewPanel(
            "snippetDetails",
            "Snippet Details",
            vscode.ViewColumn.One,
            {
              enableScripts: true,
              // localResourceRoots: [this._extensionUri],
            }
          );

          panel.webview.html = this._getSnippetDetailsHtmlForWebview(
            panel.webview
          );

          panel.webview.postMessage({ type: "setSnippetData", value: value });
          panel.webview.onDidReceiveMessage((data) => {
            const { type, value } = data;
            switch (type) {
              case "pinSnippet": {
                webviewView.webview.postMessage({
                  type: "pinSnippet",
                  value: value,
                });
                break;
              }
            }
          });
          break;
        }
        case "insertSnippet": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(value.code)
          );
          break;
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
        <script nonce="${nonce}">
          const initialRoute = "sidebar/search";
        </script>
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
          <meta http-equiv="Content-Security-Policy" content="img-src * data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src 'self' https: ws: vscode-webview:;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleMainUri}" rel="stylesheet">
          </head>
          <body>
          <script nonce="${nonce}" src="${mediaScriptUri}" type="module"></script>
          <script nonce="${nonce}" src="${scriptUri}"></script>
          <script nonce="${nonce}">
            const initialRoute = "details/1";
          </script>
          </body>  
        </html>`;
  }
}
