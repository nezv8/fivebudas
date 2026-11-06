import { defineConfig } from 'vite';

// GitHub Pages project sites are served from /<repository>/.
// The workflow sets BASE_PATH automatically. Local development and
// username.github.io/custom-domain sites use '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
});
