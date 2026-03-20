import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["*.mp3"],
      manifest: {
        name: "ようそうSRPG",
        short_name: "ようそうSRPG",
        description: "ようくんとそうくんの大冒険SRPG",
        theme_color: "#181a20",
        background_color: "#181a20",
        display: "fullscreen",
        orientation: "landscape",
        start_url: "/yousouSRPG/",
        scope: "/yousouSRPG/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html}"],
        runtimeCaching: [
          {
            urlPattern: /\.mp3$/,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              expiration: { maxEntries: 5 }
            }
          }
        ]
      }
    }),
  ],
  base: "/yousouSRPG/",
});
