// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 1. Asosiy sozlamalar
  compatibilityDate: "2025-07-15",
  // 2. CSS va Stil sozlamalari
  css: ["~/assets/scss/index.scss", "~/assets/fonts/stylesheet.css"],

  devtools: { enabled: true }, // Tezlik uchun vaqtincha o'chirilgan

  // 8. Experimental Features
  experimental: {
    appManifest: false,
  },
  imports: {
    dirs: ["store"],
  },
  modules: [
    "@nuxt/eslint",
    "nuxt-signature-pad",
    "dayjs-nuxt",
    [
      "@element-plus/nuxt",
      {
        /** Element Plus auto-import sozlamalari */
        importStyle: "scss",
        injectionID: { current: 0, prefix: 1024 },
      },
    ],
    "nuxt-qrcode",
    [
      "@pinia/nuxt",
      { autoImports: ["defineStore", "acceptHMRUpdate"], disableVuex: true },
    ],
    "@pinia-plugin-persistedstate/nuxt",
    [
      "@nuxtjs/i18n",
      {
        bundle: {
          optimizeTranslationDirective: false,
        },
        defaultLocale: "ru",
        fallbackLocale: "ru",
        langDir: "locales",
        lazy: true,
        legacy: false,
        locale: "ru",
        locales: [
          {
            code: "uz",
            file: "uz.json",
            name: "Uzbek",
          },
          {
            code: "ru",
            file: "ru.json",
            name: "Русский",
          },
          {
            code: "en",
            file: "en.json",
            name: "English",
          },
        ],
      },
    ],
    [
      "nuxt-vuefire",
      {
        analytics: true,
        auth: {
          enabled: true,
        },
        // firestore is enabled by default in nuxt-vuefire, but explicitly stating just in case, though it's optional
        config: {
          apiKey: "AIzaSyBQKW6GOgGICE0IlRIS_n3iU3QsiAE-cLg",
          appId: "1:269787511069:web:d7b83a4ee7827aed36c9f4",
          authDomain: "cost-71018.firebaseapp.com",
          measurementId: "G-SCQLV9VJ4G",
          messagingSenderId: "269787511069",
          projectId: "cost-71018",
          storageBucket: "cost-71018.firebasestorage.app",
        },
      },
    ],
  ],
  nitro: {
    experimental: {
      websocket: true, // <<< Nitro WebSocket yoqildi
    },
    storage: {
      redis: {
        driver: "redis",
        // Redis konfiguratsiyasi (agar kerak bo'lsa)
      },
    },
  },
  // https://edmsapi.sosgroup.uz/
  runtimeConfig: {
    public: {
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST,
      reverbKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY,
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT,
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME,
      tinymceKEY: "ptshvlsgd005gl07uua59lyyiiqia5pfqv5n0un2dbi820nj",
    },
  },
  ssr: false,
  vite: {
    build: {
      minify: "terser",
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              return id.split("node_modules/")[1].split("/")[0];
            }
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ["element-plus", "maska", "vue", "laravel-echo", "pusher-js"],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
});
