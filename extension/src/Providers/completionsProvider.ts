import * as vscode from "vscode";
import axios from "axios";

export class CavyarCompletionsProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const prefixRange = document.getWordRangeAtPosition(position, /cv_\w*/);
    const prefix = document.getText(prefixRange);
    if (prefix) {
      return new Promise(async (resolve, reject) => {
        const response = await axios.get("http://localhost:3000/api/snippets");

        if (response.status !== 200) {
          reject(`Unexpected status code: ${response.status}`);
        }

        const completionItems = response.data.snippets.map((snippet: any) => {
          const item = new vscode.CompletionItem(
            "c_" + snippet.title,
            vscode.CompletionItemKind.Snippet
          );
          item.insertText = new vscode.SnippetString(snippet.code);
          item.documentation = new vscode.MarkdownString(snippet.description);
          item.detail = snippet.code;

          return item;
        });
        resolve(completionItems);
      });
    }
  }
}
