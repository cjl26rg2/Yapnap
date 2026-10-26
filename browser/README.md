# Yapnap for browsers

The browser version runs the same plugins, settings panel and badges as the desktop app, inside Yapper's own tab.
It is built as a browser extension.

## Build

From the project folder:

    npm run browser:build

This writes two folders into `browser/dist/`:

- `yapnap-chrome`: for Chrome, Edge and Brave
- `yapnap-firefox`: for Firefox 128 or newer

## Install (unpacked, for testing)

- **Chrome, Brave:** open `chrome://extensions`, turn on Developer mode, click Load unpacked, and pick `browser/dist/yapnap-chrome`.
- **Edge:** open `edge://extensions`, turn on Developer mode, click Load unpacked, and pick `browser/dist/yapnap-chrome`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click Load Temporary Add-on, and pick `browser/dist/yapnap-firefox/manifest.json`.

Then open www.yapper.website. Yapnap's settings are in Yapper's own settings, under the Yapnap group.

## How it works

- `bridge.js` runs in the extension's own world. It keeps the settings in the browser's storage, with the same rules as the desktop app's main process.
- `yapnap.js` is the plugin bundle plus `page.js`. It runs in Yapper's page, and gives the settings panel the same `window.yapnap` API the desktop app has.

Desktop-only settings (tray, notifications, taskbar flashing, data folder) are hidden in the browser.

## Roles

The role list is shared: the extension reads it from yapnap.pages.dev, the same as the desktop app, and it keeps the last
copy for when the site cannot be reached. To give or remove roles, paste your role key under Roles in Yapnap's settings.
The key is saved only in this browser. See the site's README for how the owner and admins get their keys.

The role rules come from the website, so the extension itself only needs updating for new settings or panels.
