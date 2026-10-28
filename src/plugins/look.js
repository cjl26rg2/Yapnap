// Look: colours, shapes, fonts and effects. The palettes set the site's own variables (both the classic
// --bg-* set and the --nl-* set used by the newer layout), so the rest of the site follows them.
(function (Y) {
  'use strict';

  // Each palette is a set of plain colours. Declared !important so the site's theme rules cannot win.
  function palette(p) {
    var v = {
      '--bg-main': p.main, '--bg-side': p.side, '--bg-side-solid': p.side, '--bg-rail': p.rail,
      '--bg-elev': p.elev, '--bg-float': p.elev, '--bg-floating': p.elev, '--bg-hover': p.hover,
      '--bg-active': p.active, '--bg-input': p.input, '--border': p.border,
      '--text': p.text, '--text-muted': p.muted, '--text-faint': p.faint,
      '--nl-side': p.side, '--nl-rail': p.rail, '--nl-panel': p.main, '--nl-elev': p.elev,
      '--nl-hover': p.hover, '--nl-active': p.active, '--nl-input': p.input, '--nl-float': p.elev,
      '--nl-line': p.border
    };
    var decls = Object.keys(v).map(function (k) { return k + ':' + v[k] + '!important'; });
    return ':root:root:root:root,.app.app.app.app{' + decls.join(';') + '}';
  }

  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  Y.add({
    id: 'theme-amoled',
    name: 'AMOLED black',
    desc: 'Pure black backgrounds. Saves power on OLED screens.',
    category: 'Look',
    css: palette({
      main: '#000000', side: '#000000', rail: '#000000', elev: '#0b0b0c', hover: '#151517', active: '#1d1d20',
      input: '#0f0f11', border: '#1c1c20', text: '#e9eaee', muted: '#9a9da6', faint: '#6b6e77'
    })
  });

  Y.add({
    id: 'theme-graphite',
    def: true,
    name: 'Graphite',
    desc: 'Neutral dark grey with low contrast between panels.',
    category: 'Look',
    css: palette({
      main: '#1b1c20', side: '#17181c', rail: '#111215', elev: '#23252b', hover: '#2a2d34', active: '#33363e',
      input: '#14151a', border: '#2f323a', text: '#e4e6eb', muted: '#a0a4ad', faint: '#6e727c'
    })
  });

  Y.add({
    id: 'theme-sepia-night',
    name: 'Sepia night',
    desc: 'Warm brown dark theme for reading late.',
    category: 'Look',
    css: palette({
      main: '#1f1b16', side: '#1a1713', rail: '#15120f', elev: '#2a251e', hover: '#352f26', active: '#3f382d',
      input: '#17140f', border: '#3a3229', text: '#ece3d3', muted: '#b3a893', faint: '#7d7463'
    })
  });

  Y.add({
    id: 'theme-frost-light',
    name: 'Frost light',
    desc: 'A cool light theme for bright rooms.',
    category: 'Look',
    css: palette({
      main: '#f4f6f9', side: '#eaedf2', rail: '#dfe3ea', elev: '#ffffff', hover: '#e2e6ee', active: '#d6dce6',
      input: '#ffffff', border: '#d3d9e3', text: '#161922', muted: '#515a6b', faint: '#7d8594'
    })
  });

  Y.add({
    id: 'theme-forest',
    name: 'Forest',
    desc: 'Dark green-tinted theme.',
    category: 'Look',
    css: palette({
      main: '#161c18', side: '#121813', rail: '#0d120e', elev: '#1f2822', hover: '#26312a', active: '#2e3b32',
      input: '#111712', border: '#2a3830', text: '#e2ebe4', muted: '#9db3a2', faint: '#66786b'
    })
  });

  Y.add({
    id: 'accent-colour',
    name: 'Accent colour',
    desc: 'The colour of buttons, links and selections.',
    category: 'Look',
    settings: [{ key: 'hex', label: 'Colour', type: 'color', def: '#5b8def' }],
    css: function (s) {
      var on = luminance(s.hex) > 0.6 ? '#101114' : '#ffffff';
      return ':root:root:root:root,.app.app.app.app{--accent:' + s.hex + '!important;--accent-hover:' + s.hex + 'dd!important;' +
        '--accent-soft:color-mix(in srgb,' + s.hex + ' 22%,transparent)!important;--on-accent:' + on + '!important}';
    }
  });

  Y.add({
    id: 'corner-radius',
    name: 'Corner radius',
    desc: 'How round panels, cards and inputs are, in pixels. 0 is fully square.',
    category: 'Look',
    settings: [{ key: 'px', label: 'Radius', type: 'range', min: 0, max: 16, step: 1, def: 8 }],
    css: function (s) { return ':root:root:root:root,.app.app.app.app{--radius:' + s.px + 'px!important;--card-r:' + s.px + 'px!important}'; }
  });


  Y.add({
    id: 'no-blur',
    def: true,
    name: 'No background blur',
    desc: 'Removes the frosted-glass blur behind panels. Easier on slower computers.',
    category: 'Look',
    css: '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
  });

  Y.add({
    id: 'no-shadows',
    name: 'No shadows',
    desc: 'Flat look with no drop shadows.',
    category: 'Look',
    css: ':root:root:root:root,.app.app.app.app{--shadow:none!important}.modal,.ctx-menu,.mini-pop{box-shadow:none!important}'
  });

  Y.add({
    id: 'thin-scrollbars',
    def: true,
    name: 'Thin scrollbars',
    desc: 'Narrow scrollbars with no track.',
    category: 'Look',
    css: '::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}'
  });

  Y.add({
    id: 'system-font',
    name: 'System font',
    desc: 'Uses the font Windows uses for everything else.',
    category: 'Look',
    css: 'body,.app{font-family:system-ui,"Segoe UI",sans-serif!important}'
  });


  Y.add({
    id: 'high-contrast-text',
    name: 'High contrast text',
    desc: 'Brighter text on the same backgrounds.',
    category: 'Look',
    css: ':root:root:root:root,.app.app.app.app{--text:#ffffff!important;--text-muted:#cfd2d9!important;--text-faint:#aeb2bb!important}'
  });


  Y.add({
    id: 'ui-scale',
    name: 'Interface scale',
    desc: 'Makes the whole interface smaller or bigger, as a percentage.',
    category: 'Look',
    settings: [{ key: 'pct', label: 'Scale', type: 'range', min: 80, max: 120, step: 5, def: 100 }],
    css: function (s) { return 'html{zoom:' + (s.pct / 100).toFixed(2) + '}'; }
  });


  Y.add({
    id: 'flat-backgrounds',
    name: 'Flat backgrounds',
    desc: 'Removes background images and gradients.',
    category: 'Look',
    css: '*{background-image:none!important}'
  });

  Y.add({
    id: 'round-avatars',
    name: 'Round avatars',
    desc: 'Every profile picture is a circle, including in messages.',
    category: 'Look',
    css: '.avatar,.msg .avatar{border-radius:50%!important}'
  });


})(window.YAPNAP);
