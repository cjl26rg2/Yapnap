# Changelog

What changed in each Yapnap release, newest first.

## 1.0.1 (2026-10-27)

- Colour themes show in the chat. They used to lose to Yapper's new look, so they changed nothing.
- Theme files: install one from the Themes page with Install a theme file, and remove it with Remove theme. A theme can have a PNG or GIF background from the Yapnap website. The picture shows through the panels, and Image opacity sets how much.
- Custom CSS accepts child selectors such as .messages > div again. Links to files, @import, script URLs, backslashes and image-set() are still not allowed.
- A theme file cannot add CSS of its own. Its picture has to be plain image data.
- Notifications and links can no longer open other websites inside Yapnap.
- The role key is stored encrypted, and it moves out of the settings file the first time 1.0.1 starts. A settings file over 8 MB is refused.
- Role requests never follow a redirect, so the role key is never sent to another address.
- Roles, the role key, reset, sign-out, and theme and settings files can only be changed by a click in the panel, not by a script on the page.
- Plugins: filter by On, Off or Changed; All on and All off for each category; Reset on any plugin that differs from its default; and a notice for plugins that are on but did not start here, with Turn them off.

## 1.0.0 (2026-10-27)

- The desktop app is redesigned: About, Settings, Plugins and Themes have a clearer layout, and anything that cannot be undone asks first in a dialog.
- A plugin that fails to start shows as Failed, with the reason, instead of looking as if it works.
- The theme picker works with the arrow keys, and each theme shows a small preview of its colours.
- The update notice is a small card in the corner that you can dismiss. It no longer covers the top of Yapper.
- Safe mode is a switch in Settings, with a notice whenever it is on.
- The settings window and the load error page use the same look, and they only load what comes with the app.
- 37 more plugins, 200 in all.
- Yapper keeps its own names. The window title rename and the logo swap are removed.
- The website has a new design, a menu on phones, and a download page that finds the newest GitHub release.

## 0.3.0 (2026-10-26)

- A new look for the website: a dark theme, the Yapnap logo, and clearer pages.
- Windows and Linux updates can come from the release zip, not only from the update files.
- An update bar inside Yapnap shows when a newer version is out, and it stays until you restart or dismiss it.
- 165 plugins, including a top-bar brand setting, an optional Yapnap logo, and many small tidy-ups for messages, replies, reactions, the sidebar, the composer, members and voice.
- Settings can be saved to a file and loaded again from the Settings page.
- Roles are shared with everyone: owner, co-owner, admin, mod, contributor and the cosmetic roles. The owner and admins give them with a role key.
- Custom CSS in Settings, added after every plugin so it wins. Links to files and script are not allowed.
- A browser loader for Chrome, Edge, Brave and Firefox, with the same plugins and roles. New, still being tested.

## 0.2.0 (2026-10-26)

- First public release: a portable app and an installer for Windows 10 and 11 (64-bit), and an AppImage for Linux.
- Yapnap settings live inside Yapin' under a Yapnap section: About, Settings, Plugins and Themes.
- Contributor badges for everyone who runs Yapnap, with roles given out by the owner and admins.
- Safe mode turns every plugin off without losing your settings.
- Debug information on the About page, to paste into a bug report.
