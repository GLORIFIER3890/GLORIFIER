import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const githubPagesBuild = process.env.GITHUB_PAGES_BUILD === 'true';

  return {
    // Railway and Cloudflare serve GLORIFIER from the domain root.
    // GitHub Pages project-site builds opt in to this repository's subpath.
    base: process.env.CAPACITOR_BUILD === 'true'
      ? './'
      : process.env.CLOUDFLARE_BUILD === 'true'
        ? '/'
        : githubPagesBuild
          ? '/GLORIFIER/'
          : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
