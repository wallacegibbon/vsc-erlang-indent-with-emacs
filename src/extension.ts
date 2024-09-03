import * as vscode from "vscode";

import { FormattingOptions, ProviderResult, Range, TextDocument, TextEdit, workspace } from "vscode";

import child_process = require("child_process");
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
    let output_channel = vscode.window.createOutputChannel("Erlang Indent With Emacs");
    vscode.languages.registerDocumentRangeFormattingEditProvider("erlang", {
        provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions): ProviderResult<TextEdit[]> {
            return format(document, range, options, output_channel);
        },
    });
}

export function deactivate() { }

function indent_with_emacs(current_buffer_file_path: string, point_start: number, point_end: number, tab_size: number, insert_spaces: boolean) {
    const config = workspace.getConfiguration("erlang_emacs_format");
    const sdk_path = (config.get("erlang_sdk_path") as string).replace(/\\/g, "/");
    return `(progn
(find-file "${current_buffer_file_path}")
(setq erlang-root-dir "${sdk_path}")
(setq load-path (cons (car (file-expand-wildcards (concat erlang-root-dir "/lib/tools-*/emacs"))) load-path))
(setq exec-path (cons (car (file-expand-wildcards (concat erlang-root-dir "/bin"))) exec-path))
(require 'erlang-start)
(erlang-mode)
(setq tab-width ${tab_size})
(narrow-to-region ${point_start} ${point_end})
(indent-region (point-min) (point-max))
(${insert_spaces ? "untabify" : "tabify"} (point-min) (point-max))
(delete-trailing-whitespace)
(widen)
(write-region (point-min) (point-max) "${current_buffer_file_path}")
(kill-emacs))`
        .replace(/\n/g, " ");
}

function get_region_points(document: TextDocument, range: Range) {

    function countCharacters(text: string): number {
        // This method counts the actual number of characters, not UTF-16 code units
        return Array.from(text).length;
    }

    // Calculate the start character index
    let startCharIndex = 0;
    for (let i = 0; i < range.start.line; i++) {
        startCharIndex += countCharacters(document.lineAt(i).text) + 1; // Add 1 for the newline character
    }
    startCharIndex += countCharacters(document.lineAt(range.start.line).text.slice(0, range.start.character));

    // Calculate the end character index
    let endCharIndex = 0;
    for (let i = 0; i < range.end.line; i++) {
        endCharIndex += countCharacters(document.lineAt(i).text) + 1; // Add 1 for the newline character
    }
    endCharIndex += countCharacters(document.lineAt(range.end.line).text.slice(0, range.end.character));

    return [startCharIndex+1, endCharIndex+1];

}

function format(document: TextDocument, range: Range, options: FormattingOptions, output_channel: vscode.OutputChannel): Promise<TextEdit[]> {
    return new Promise((resolve, reject) => {
        if (document.isDirty) {
            vscode.window.showErrorMessage("Cannot format, file has unsaved changes!");
            reject();
            return;
        }

        const file_basename = path.basename(document.fileName);
        const file_dirname = path.dirname(document.fileName);
        const [point_start, point_end] = get_region_points(document, range);

        const elisp = indent_with_emacs(file_basename, point_start, point_end, options.tabSize, options.insertSpaces);
        output_channel.appendLine(`Formatting with command: emacs --batch --eval ${elisp}`);

        const formatter = child_process.spawn("emacs", ["--batch", "--eval", elisp], {
            cwd: file_dirname,
        });

        formatter.on("error", (err) => {
            output_channel.appendLine(err.message);
            vscode.window.showErrorMessage("Format error, check 'Erlang Indent With Emacs' channel for details!");
            reject(err.message);
        });

        formatter.on("message", (msg) => {
            output_channel.appendLine(msg.toString());
        });

        formatter.on("close", () => {
            resolve([]);
        });

        formatter.stderr.on("data", (data) => {
            output_channel.appendLine(data);
        });

        formatter.stdout.on("data", (data) => {
            output_channel.appendLine(data);
        });
    });
}