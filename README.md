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

## About VSCode version

This extension only works for VSCode newer than "1.68.0". (this is the limit from the auto-generated package.json).

It should work on older versions (since this extension is simple and doesn't use many APIs of VSCode), but it is not convenient for me to test those old versions. And I don't really have the time to do those tests.

You are very welcomed to fork this extension and make it support old versions of VSCode.

**Enjoy!**

