// Members and profiles: the member list, profile cards and menus.
(function (Y) {
  'use strict';


  Y.add({
    id: 'member-list-width',
    name: 'Member list width',
    desc: 'How wide the member list is, in pixels.',
    category: 'Members',
    settings: [{ key: 'px', label: 'Width', type: 'range', min: 180, max: 320, step: 4, def: 232 }],
    css: function (s) { return '.members-panel{width:' + s.px + 'px!important}'; }
  });


  Y.add({
    id: 'hide-profile-badges',
    name: 'Hide profile badges',
    desc: 'Hides the badge row on profile cards and in member lists.',
    category: 'Members',
    css: '.badge-row{display:none!important}'
  });




})(window.YAPNAP);
