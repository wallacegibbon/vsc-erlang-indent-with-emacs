**CAUTION**: Run VSCE commands in CMD instead of Git Bash on Windows.

Before publishing, you need to login:

```sh
npx vsce login wallacegibbon
```

This command will need your Access Token.
(You can get it from <https://dev.azure.com/wallacegibbon/_usersSettings/tokens>)

Then you can publish the extension:
```sh
npm run publish
```
