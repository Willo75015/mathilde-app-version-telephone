import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // Optimisations React pour éviter les re-renders
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    // VitePWA désactivé en développement pour éviter les conflits
    ...(process.env.NODE_ENV === 'production' ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mathilde Fleurs - Gestion Événements',
        short_name: 'Mathilde Fleurs',
        description: 'Application PWA pour la gestion d\'événements fleuriste',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true
      }
    })] : [])
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@contexts': resolve(__dirname, './src/contexts')
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', '@headlessui/react'],
          utils: ['zod', 'crypto-js', 'dompurify']
        }
      }
    },
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    // Configuration ANTI-REFRESH optimisée
    port: 3026,
    host: '0.0.0.0', // Accessible depuis le réseau local (téléphone)
    strictPort: true,
    
    // HMR Configuration pour éviter les reloads intempestifs
    hmr: {
      overlay: false,
      port: 3024, // Port différent pour HMR
      host: 'localhost'
    },
    
    // Surveillance fichiers optimisée
    watch: {
      // Ignorer les dossiers qui causent des reloads inutiles
      ignored: [
        '**/node_modules/**',
        '**/dist/**', 
        '**/.git/**',
        '**/coverage/**',
        '**/public/**',
        '**/.vscode/**',
        '**/*.log',
        '**/tmp/**',
        '**/temp/**'
      ],
      // Réduire la sensibilité
      usePolling: false,
      interval: 1000,
      binaryInterval: 2000
    },
    
    // Autres optimisations
    fs: {
      strict: false
    }
  },
  
  // Configuration de base pour éviter les erreurs
  define: {
    global: 'globalThis',
  },
  
  // Éviter les logs excessifs
  logLevel: 'warn'
})