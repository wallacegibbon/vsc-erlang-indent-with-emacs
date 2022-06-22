import * as vscode from "vscode";
import child_process = require("child_process");
import { workspace, TextDocument, TextEdit, window, ProviderResult } from "vscode";
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
    let output_channel = vscode.window.createOutputChannel("Erlang Indent With Emacs");
    vscode.languages.registerDocumentFormattingEditProvider("erlang", {
        provideDocumentFormattingEdits(document: TextDocument): ProviderResult<TextEdit[]> {
            output_channel.appendLine(document.fileName);
            return format(document.fileName, output_channel);
        },
    });
}

export function deactivate() { }

function indent_with_emacs(current_buffer_file_path: string) {
    const config = workspace.getConfiguration("erlang_emacs_format");
    const sdk_path = (config.get("erlang_sdk_path") as string).replace(/\\/g, "/");
    return `(progn
(find-file "${current_buffer_file_path}")
(setq erlang-root-dir "${sdk_path}")
(setq load-path (cons (car (file-expand-wildcards (concat erlang-root-dir "/lib/tools-*/emacs"))) load-path))
(require 'erlang-start)
(erlang-mode)
(erlang-indent-current-buffer)
(delete-trailing-whitespace)
(untabify (point-min) (point-max))
(write-region (point-min) (point-max) "${current_buffer_file_path}")
(kill-emacs))`.replace(/\n/g, " ");
}

function format(file_path: string, output_channel: vscode.OutputChannel): Promise<TextEdit[]> {
    return new Promise((resolve) => {
        const file_basename = path.basename(file_path);
        const file_dirname = path.dirname(file_path);
        const elisp = indent_with_emacs(file_basename);
        output_channel.appendLine(`Formatting with command: emacs --batch --eval ${elisp}`);

        const formatter = child_process.spawn("emacs", ["--batch", "--eval", elisp], {
            cwd: file_dirname,
        });

        formatter.on("error", (err) => {
            output_channel.appendLine(err.message);
        });

        formatter.on("message", (msg) => {
            output_channel.appendLine(msg.toString());
        });

        formatter.stderr.on("data", (data) => {
            output_channel.appendLine(data);
        });

        formatter.stdout.on("data", (data) => {
            if (false) {
                window.showErrorMessage(data.toString());
            }
            output_channel.appendLine(data);
        });

        resolve([]);
    });
}