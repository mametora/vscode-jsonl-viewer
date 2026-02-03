import * as vscode from "vscode";
import { parseJsonl, JsonlData } from "./jsonlDocument";
import { parseQuery, executeQuery } from "./queryEngine";

export class JsonlEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "jsonlViewer.editor";

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new JsonlEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      JsonlEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "webview-ui", "dist"),
      ],
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    let jsonlData: JsonlData | null = null;

    const updateWebview = () => {
      jsonlData = parseJsonl(document.getText());
      webviewPanel.webview.postMessage({
        type: "update",
        data: jsonlData,
      });
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case "ready":
          updateWebview();
          break;

        case "query":
          if (jsonlData) {
            try {
              const parsed = parseQuery(message.sql);
              const result = executeQuery(jsonlData.rows, parsed);
              webviewPanel.webview.postMessage({
                type: "queryResult",
                result: {
                  rows: result.rows,
                  columns: parsed.columns === "*" ? jsonlData.columns : parsed.columns,
                  totalCount: result.totalCount,
                  filteredCount: result.filteredCount,
                },
              });
            } catch (e) {
              webviewPanel.webview.postMessage({
                type: "queryError",
                error: e instanceof Error ? e.message : String(e),
              });
            }
          }
          break;

        case "goToLine": {
          const lineNumber = message.line as number;
          const position = new vscode.Position(lineNumber - 1, 0);
          vscode.window.showTextDocument(document, {
            selection: new vscode.Range(position, position),
            viewColumn: vscode.ViewColumn.Beside,
          });
          break;
        }
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview-ui",
        "dist",
        "assets",
        "index.js"
      )
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview-ui",
        "dist",
        "assets",
        "index.css"
      )
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link rel="stylesheet" href="${styleUri}">
  <title>JSONL Viewer</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
