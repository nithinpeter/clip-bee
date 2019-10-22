import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    'clipbee.showClipboardHistory',
    async () => {
      try {
        const response = await fetch('http://127.0.0.1:5505/api/items');
        const data: string[] = await response.json();

        const selected = await vscode.window.showQuickPick(data);
        await pasteSelected(selected || '');
      } catch {
        vscode.window.showErrorMessage('ClipBee Mac app is not running!');
      }
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
