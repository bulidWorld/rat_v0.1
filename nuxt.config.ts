// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss'],

  tailwindcss: {
    cssPath: '~/assets/css/globals.css',
  },

  app: {
    head: {
      title: '需求管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  devServer: {
    host: '0.0.0.0',
    port: 10524,
  },

  compatibilityDate: '2025-01-01',
});
