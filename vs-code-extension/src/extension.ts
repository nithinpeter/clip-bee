import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    'extension.showClipboard',
    async () => {
      const response = await fetch('http://localhost:4444');
      const data: string[] = await response.json();

      const selected = await vscode.window.showQuickPick(data);
      await pasteSelected(selected || '');
    }
  );

  context.subscriptions.push(disposable);
}

const pasteSelected = async (text: string) => {
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    // delete anything currently selected
    const selection = activeEditor!.selection;
    if (selection) {
      await activeEditor.edit(textInserter => {
        textInserter.delete(activeEditor!.selection);
      });
    }

    await activeEditor.edit(function(textInserter) {
      textInserter.insert(selection.start, text);
    });
  }
};

export function deactivate() {}
