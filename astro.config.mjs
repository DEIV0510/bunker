import { defineConfig } from 'astro/config';

// Dominio público: canonical, Open Graph y sitemap salen con URL absoluta.
// PENDIENTE: cambiarlo por el dominio real (o definir SITE_URL al compilar).
const site = process.env.SITE_URL || 'https://bunkersneakers.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS en línea: una petición bloqueante menos por página.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  server: { port: 5451, host: true },
});
