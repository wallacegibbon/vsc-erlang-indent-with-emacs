## Erlang Indent With Emacs

This extension simply calls `emacs` to indent the current file.

The Erlang plugin for IntelliJ IDEA support calling emacs to indent file, this extension can do the same thing.

## Why Emacs

There are many powerful formatters for Erlang, most of them will parse the erlang sources then stringify the AST.
But usually the generated codes are too rigid.

On the other hand, tools like Emacs and Vim only do simple re-indent,
lines won't be break, and newlines won't be introduced.

I prefer the Emacs way, this is why this tool is created.

## Notice

- The `emacs` binary should be able to be found by PATH environment variable.
- Set `"erlang_emacs_format.erlang_sdk_path"` (the path of your erlang sdk) before using this extension.

This extension won't change frequently, but I will update it when incompatible changes were introduced by VSCode.

**Enjoy!**
