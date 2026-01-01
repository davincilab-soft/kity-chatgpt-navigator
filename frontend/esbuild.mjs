import * as esbuild from 'esbuild';
import * as fs from 'fs';

const isWatch = process.argv.includes('--watch');

// Create manifest
const manifest = {
  manifest_version: 3,
  name: 'Kity ChatGPT Navigator',
  short_name: 'Kity',
  version: '1.0.1',
  description: 'Fast ChatGPT Navigator',
  minimum_chrome_version: '106',
  homepage_url: 'https://kity.software',
  permissions: ['clipboardWrite', 'storage'],
  host_permissions: [
    'https://chat.openai.com/*',
    'https://chatgpt.com/*',
  ],
  background: {
    service_worker: 'background.js',
  },
  icons: {
    16: 'icons/Icon16px.png',
    32: 'icons/Icon32px.png',
    48: 'icons/Icon48px.png',
    128: 'icons/Icon128px.png',
  },
  content_scripts: [
    {
      matches: [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*'
      ],
      js: ['content.js'],
      css: ['styles.css'],
      run_at: 'document_end',
    },
  ],
  commands: {
    'focus-sidebar': {
      suggested_key: { default: 'Ctrl+Left' },
      description: 'Focus sidebar',
    },
    'focus-main': {
      suggested_key: { default: 'Ctrl+Right' },
      description: 'Focus main pane',
    },
    'prev-user': {
      suggested_key: { default: 'Ctrl+Shift+Up' },
      description: 'Previous user message',
    },
    'next-user': {
      suggested_key: { default: 'Ctrl+Shift+Down' },
      description: 'Next user message',
    },
  },
  action: {
    default_popup: 'popup.html',
    default_icon: {
      16: 'icons/Icon16px.png',
      32: 'icons/Icon32px.png',
      48: 'icons/Icon48px.png',
      128: 'icons/Icon128px.png',
    },
  },
  web_accessible_resources: [
    {
      resources: ['themes/christmas/*'],
      matches: [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
      ],
    },
  ],
};

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));

// Copy public assets
if (fs.existsSync('public')) {
  fs.cpSync('public', 'dist', { recursive: true });
}

// Copy styles and popup
fs.copyFileSync('src/content/styles.css', 'dist/styles.css');
if (fs.existsSync('src/popup/popup.html')) {
  fs.copyFileSync('src/popup/popup.html', 'dist/popup.html');
}
fs.mkdirSync('dist/popup', { recursive: true });
if (fs.existsSync('src/popup/popup.css')) {
  fs.copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');
}
['Icon_grey16px.png', 'Icon_grey32px.png', 'Icon_grey48px.png', 'Icon_grey128px.png'].forEach((icon) => {
  const source = `public/icons/${icon}`;
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, `dist/icons/${icon}`);
  }
});

const buildOptions = {
  entryPoints: {
    content: 'src/content/index.ts',
    background: 'src/popup/background.ts',
    'popup/popup': 'src/popup/popup.ts',
  },
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  sourcemap: isWatch,
  logLevel: 'info',
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}
