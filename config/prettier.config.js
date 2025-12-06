/**
 * 🎨 CONFIGURATION PRETTIER
 * Configuration de formatage du code pour Mathilde Fleurs
 */

/** @type {import("prettier").Config} */
export default {
  // Configuration de base
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // Configuration spécifique par type de fichier
  overrides: [
    // JavaScript et TypeScript
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      options: {
        semi: false,
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        trailingComma: 'es5',
        arrowParens: 'avoid',
        bracketSpacing: true,
        bracketSameLine: false
      }
    },
    
    // JSON
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 80,
        tabWidth: 2,
        semi: false,
        singleQuote: false,
        trailingComma: 'none'
      }
    },
    
    // CSS, SCSS, Less
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        semi: true,
        singleQuote: true
      }
    },
    
    // HTML
    {
      files: ['*.html'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'css'
      }
    },
    
    // Markdown
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
        tabWidth: 2,
        proseWrap: 'always',
        embeddedLanguageFormatting: 'auto'
      }
    },
    
    // YAML
    {
      files: ['*.yml', '*.yaml'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        bracketSpacing: true,
        singleQuote: true
      }
    },
    
    // Fichiers de configuration
    {
      files: [
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        '*.config.cjs',
        'vite.config.*',
        'vitest.config.*',
        'playwright.config.*',
        'tailwind.config.*'
      ],
      options: {
        printWidth: 120,
        tabWidth: 2,
        semi: false,
        singleQuote: true,
        trailingComma: 'es5'
      }
    },
    
    // Package.json spécifique
    {
      files: ['package.json'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        semi: false,
        singleQuote: false,
        trailingComma: 'none'
      }
    },
    
    // Scripts de déploiement
    {
      files: ['scripts/*.sh', 'scripts/*.bash'],
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false
      }
    }
  ],
  
  // Plugins spécifiques
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ],
  
  // Configuration du tri des imports
  importOrder: [
    // 1. Imports React
    '^react$',
    '^react/(.*)$',
    '^react-(.*)$',
    
    // 2. Imports de librairies externes
    '<THIRD_PARTY_MODULES>',
    
    // 3. Imports absolus de notre app
    '^@/(.*)$',
    '^@components/(.*)$',
    '^@hooks/(.*)$',
    '^@utils/(.*)$',
    '^@lib/(.*)$',
    '^@types/(.*)$',
    '^@contexts/(.*)$',
    '^@assets/(.*)$',
    
    // 4. Imports relatifs
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true,
  
  // Configuration Tailwind CSS
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  
  // Ignorer certains fichiers
  ignore: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    '.output',
    '.vercel',
    '.netlify',
    'public/sw.js',
    'public/workbox-*.js',
    '*.min.js',
    '*.min.css',
    'CHANGELOG.md',
    'LICENSE',
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml'
  ]
}
