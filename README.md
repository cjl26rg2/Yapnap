# Yapnap

An unofficial desktop app for Yapin'. It opens the chat in its own window and adds plugins, themes, settings
and contributor badges.

Yapnap is a fan project. It is not made by, or affiliated with, Yapin' or the Yapper team.

## Build and check

Requirements: Windows 10 or 11, Node.js 22.

    npm install
    npm run check      # checks Yapnap's plugins
    npm start          # runs the app from source
    npm run dist       # builds the portable Windows exe into dist/

With the app running with `--remote-debugging-port=9333`, `npm run test:live` turns every plugin on and off in the
live app and checks that it behaves. It restores each plugin's setting afterwards.

## Plugins

Plugins live in `src/plugins/`. Each one is a small file that registers itself with `window.YAPNAP.add(...)`.
`npm run check` enforces the rules: unique ids, real class names from the chat site, no network, no storage and
no `eval`.

## Licence

The code is released under the MIT licence. See [LICENSE](LICENSE). Yapin' and its names and logos belong to their owners, and they are not covered by this licence.
