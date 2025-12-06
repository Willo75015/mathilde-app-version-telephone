/**
 * 🧪 CONFIGURATION JEST
 * Configuration optimisée pour tests unitaires avec Vitest
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Environnement de test
    environment: 'jsdom',
    
    // Fichiers de setup
    setupFiles: ['./tests/setup.ts'],
    
    // Extensions et patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    exclude: [
      'node_modules',
      'dist',
      'build',
      'tests/e2e/**/*'
    ],
    
    // Globals pour Jest API
    globals: true,
    
    // Configuration du coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      
      // Seuils de couverture
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      
      // Fichiers à inclure/exclure
      include: [
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      
      exclude: [
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/**/*.stories.{js,ts,jsx,tsx}',
        'src/**/*.d.ts'
      ]
    },
    
    // Configuration des mocks
    deps: {
      inline: [
        '@testing-library/jest-dom',
        '@testing-library/user-event'
      ]
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter de test
    reporter: ['verbose', 'json', 'html'],
    
    // Configuration pour les tests en mode watch
    watch: {
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**'
      ]
    }
  },
  
  // Alias de résolution
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@components': resolve(__dirname, '../src/components'),
      '@hooks': resolve(__dirname, '../src/hooks'),
      '@utils': resolve(__dirname, '../src/utils'),
      '@types': resolve(__dirname, '../src/types'),
      '@contexts': resolve(__dirname, '../src/contexts'),
      '@lib': resolve(__dirname, '../src/lib'),
      '@assets': resolve(__dirname, '../src/assets'),
      '@tests': resolve(__dirname, '../tests')
    }
  },
  
  // Configuration pour les transformations
  esbuild: {
    target: 'node14'
  }
})
