import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://azuzo99.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  // Never inline fonts/images as base64 into CSS (keeps CSS small; fonts are preloaded instead).
  vite: { build: { assetsInlineLimit: 0 } },
});
