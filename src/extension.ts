import * as vscode from "vscode";
import { JsonlEditorProvider } from "./jsonlEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(JsonlEditorProvider.register(context));
}

export function deactivate() {}
