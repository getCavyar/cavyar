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
    console.log("GOT HERE 0");
    const prefixRange = document.getWordRangeAtPosition(position, /cv_\w*/);
    const prefix = document.getText(prefixRange);
    if (prefix) {
      return new Promise(async (resolve, reject) => {
        const response = await axios.get(
          "https://cavyar.fly.dev/api/snippets?discovery=true"
        );

        console.log("got here 1");
        if (response.status !== 200) {
          reject(`Unexpected status code: ${response.status}`);
          console.log("got here 2");
        }

        console.log("got here 4");
        const completionItems = response.data.data.topSnippets.map(
          (snippet: any) => {
            const item = new vscode.CompletionItem(
              "cv_" + snippet.title,
              vscode.CompletionItemKind.Snippet
            );
            item.insertText = new vscode.SnippetString(snippet.code);
            item.documentation = new vscode.MarkdownString(snippet.description);
            item.detail = snippet.code;

            return item;
          }
        );

        console.log("got here 4", completionItems);
        resolve(completionItems);
      });
    }
  }
}
