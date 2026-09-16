import * as vscode from "vscode";
import { BlackdoorHoverProvider } from "./hover";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { language: "blackdoor" },
      new BlackdoorHoverProvider(),
    ),
  );
}

export function deactivate(): void {
  // Nothing to clean up; the provider is disposed via context.subscriptions.
}
