import * as vscode from "vscode";
import { CavyarCompletionsProvider, CavyarViewProvider } from "./Providers";

export function activate(context: vscode.ExtensionContext) {
  const cavyarCompletionsProvider = new CavyarCompletionsProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      {
        // allow any language using pattern
        pattern: "**/*",
      },
      cavyarCompletionsProvider,
      // trigger when user types cv_
      "c."
    )
  );

  const provider = new CavyarViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CavyarViewProvider.viewType,
      provider
    )
  );
}
