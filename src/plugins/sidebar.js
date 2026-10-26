// Sidebar: the server list, channel list and the dots and badges around them.
(function (Y) {
  'use strict';

  Y.add({
    id: 'hide-server-rail',
    name: 'Hide server list',
    desc: 'Hides the column of server icons. Alt+1 to Alt+9 still jump between servers.',
    category: 'Sidebar',
    css: '.rail{display:none!important}'
  });

  Y.add({
    id: 'slim-server-rail',
    name: 'Server list width',
    desc: 'How wide the server icon column is, in pixels.',
    category: 'Sidebar',
    settings: [{ key: 'px', label: 'Width', type: 'range', min: 56, max: 96, step: 2, def: 72 }],
    css: function (s) { return '.rail{width:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'round-server-icons',
    name: 'Round server icons',
    desc: 'Server icons are circles instead of rounded squares.',
    category: 'Sidebar',
    css: '.rail-item{border-radius:50%!important}'
  });

  Y.add({
    id: 'hide-server-banners',
    name: 'Hide server banners',
    desc: 'Hides the banner image across the top of a server.',
    category: 'Sidebar',
    css: '.server-banner{display:none!important}'
  });

  Y.add({
    id: 'hide-rail-badges',
    name: 'Hide server badges',
    desc: 'Hides the unread count on server icons.',
    category: 'Sidebar',
    css: '.rail-badge{display:none!important}'
  });

  Y.add({
    id: 'hide-unread-dots',
    name: 'Hide unread dots',
    desc: 'Hides the dot that marks a channel with new messages.',
    category: 'Sidebar',
    css: '.unread{display:none!important}'
  });

  Y.add({
    id: 'hide-status-dots',
    name: 'Hide status dots',
    desc: 'Hides the online, idle and do-not-disturb dots on avatars.',
    category: 'Sidebar',
    css: '.status-dot{display:none!important}'
  });

  Y.add({
    id: 'sidebar-width',
    name: 'Channel sidebar width',
    desc: 'How wide the channel list is, in pixels.',
    category: 'Sidebar',
    settings: [{ key: 'px', label: 'Width', type: 'range', min: 180, max: 320, step: 4, def: 240 }],
    css: function (s) { return '.sidebar{width:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'active-channel-bar',
    name: 'Active channel bar',
    desc: 'A thin accent bar on the channel you are in.',
    category: 'Sidebar',
    css: '.channel-row.active{box-shadow:inset 3px 0 0 var(--accent)}'
  });

  Y.add({
    id: 'section-labels-caps',
    name: 'Capital section labels',
    desc: 'Section titles in the channel list use small capitals.',
    category: 'Sidebar',
    css: '.section-label{text-transform:uppercase;letter-spacing:.08em;font-size:11px}'
  });

  Y.add({
    id: 'hide-dm-dock',
    name: 'Hide direct message dock',
    desc: 'Hides the dock of open direct messages.',
    category: 'Sidebar',
    css: '.dm-dock{display:none!important}'
  });

  Y.add({
    id: 'hide-channel-glyphs',
    name: 'Hide channel symbols',
    desc: 'Removes the # and speaker symbols in front of channel names.',
    category: 'Sidebar',
    css: '.channel-glyph{display:none!important}'
  });

  Y.add({
    id: 'compact-channel-rows',
    name: 'Compact channel rows',
    desc: 'Channels in the list sit closer together.',
    category: 'Sidebar',
    css: '.channel-row{padding-top:2px!important;padding-bottom:2px!important}'
  });

  Y.add({
    id: 'channel-name-size',
    name: 'Channel name size',
    desc: 'Font size of channel names in the sidebar, in pixels.',
    category: 'Sidebar',
    settings: [{ key: 'px', label: 'Size', type: 'range', min: 11, max: 16, step: 1, def: 14 }],
    css: function (s) { return '.channel-row{font-size:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'channel-hover-tint',
    name: 'Channel hover tint',
    desc: 'The channel under the pointer gets a background tint.',
    category: 'Sidebar',
    css: '.channel-row:hover{background:var(--bg-hover)}'
  });

  Y.add({
    id: 'compact-top-bar',
    name: 'Top bar height',
    desc: 'How tall the bar across the top of the window is, in pixels.',
    category: 'Sidebar',
    settings: [{ key: 'px', label: 'Height', type: 'range', min: 32, max: 56, step: 2, def: 44 }],
    css: function (s) { return ':root{--tb-h:' + s.px + 'px}'; }
  });

  Y.add({
    id: 'still-server-icons',
    name: 'Still server icons',
    desc: 'Server icons no longer lift or bounce under the pointer.',
    category: 'Sidebar',
    css: '.rail-item:hover{transform:none!important}'
  });
})(window.YAPNAP);
