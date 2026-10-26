// Members and profiles: the member list, profile cards and menus.
(function (Y) {
  'use strict';

  Y.add({
    id: 'hide-member-list',
    name: 'Hide member list',
    desc: 'Hides the list of people on the right of a server.',
    category: 'Members',
    css: '.members-panel{display:none!important}'
  });

  Y.add({
    id: 'member-list-width',
    name: 'Member list width',
    desc: 'How wide the member list is, in pixels.',
    category: 'Members',
    settings: [{ key: 'px', label: 'Width', type: 'range', min: 180, max: 320, step: 4, def: 232 }],
    css: function (s) { return '.members-panel{width:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'hide-avatar-decorations',
    name: 'Hide avatar decorations',
    desc: 'Hides the frames and effects drawn around profile pictures.',
    category: 'Members',
    css: '.avatar-deco{display:none!important}'
  });

  Y.add({
    id: 'hide-profile-badges',
    name: 'Hide profile badges',
    desc: 'Hides the badge row on profile cards and in member lists.',
    category: 'Members',
    css: '.badge-row{display:none!important}'
  });

  Y.add({
    id: 'compact-profile-cards',
    name: 'Compact profile cards',
    desc: 'Profile cards are narrower.',
    category: 'Members',
    css: '.profile-card{max-width:280px!important}'
  });

  Y.add({
    id: 'flat-profile-sections',
    name: 'Flat profile sections',
    desc: 'Sections inside a profile card lose their boxes and shadows.',
    category: 'Members',
    css: '.profile-card-section{background:transparent!important;box-shadow:none!important}'
  });

  Y.add({
    id: 'square-profile-avatars',
    name: 'Square profile avatars',
    desc: 'The large picture on a profile card gets rounded square corners.',
    category: 'Members',
    css: '.profile-card-avatar{border-radius:8px!important}'
  });

  Y.add({
    id: 'text-only-menus',
    name: 'Text-only menus',
    desc: 'Right-click menus show words only, without icons.',
    category: 'Members',
    css: '.ctx-menu svg{display:none!important}'
  });
})(window.YAPNAP);
