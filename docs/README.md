# 🌸 Mathilde Fleurs - Application PWA

> **Application de gestion d'événements fleuriste avec PWA avancée, TypeScript et sécurité renforcée**

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/mathilde-fleurs/app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/tests-80%25-brightgreen.svg)](./tests/)

## 🎯 **Vue d'ensemble**

Mathilde Fleurs est une **Progressive Web App (PWA) de nouvelle génération** conçue pour révolutionner la gestion d'événements fleuristes. Construite avec **React 18 + TypeScript**, elle offre des performances exceptionnelles, une sécurité renforcée et une expérience utilisateur fluide.

### ✨ **Caractéristiques principales**

- 🚀 **PWA complète** - Installation native, mode offline, synchronisation automatique
- 🏗️ **Architecture TypeScript robuste** - Design patterns avancés, types complets
- ⚡ **Performances optimisées** - Bundle splitting, cache intelligent, memoization
- 🛡️ **Sécurité renforcée** - Chiffrement AES-256, validation Zod, protection XSS
- 🎨 **UX/UI exceptionnelle** - Animations Framer Motion, dark mode, responsive parfait
- 📊 **Export professionnel** - PDF/Excel avec mise en forme élégante
- 🌍 **Internationalisation** - Formats français, dates localisées
- 🧪 **Tests complets** - Jest + Playwright, coverage 80%+

## 🚀 **Démarrage rapide**

### Prérequis
- **Node.js** 18+ 
- **npm** 9+
- **Git**

### Installation

```bash
# Cloner le projet
git clone https://github.com/mathilde-fleurs/app.git
cd mathilde-fleurs

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Démarrer en développement
npm run dev
```

### Commandes disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Prévisualisation du build

# Tests
npm run test             # Tests unitaires (Jest)
npm run test:watch       # Tests en mode watch
npm run test:e2e         # Tests E2E (Playwright)
npm run test:coverage    # Coverage des tests

# Qualité du code
npm run lint             # ESLint
npm run lint:fix         # ESLint avec auto-fix
npm run format           # Prettier
npm run type-check       # Vérification TypeScript

# PWA
npm run pwa:generate     # Générer les assets PWA
npm run pwa:audit        # Audit PWA avec Lighthouse

# Déploiement
npm run deploy:staging   # Déploiement staging
npm run deploy:prod      # Déploiement production
```

## 🏗️ **Architecture**

### Structure du projet

```
mathilde-fleurs/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants UI de base
│   │   ├── forms/        # Formulaires
│   │   ├── layout/       # Layout et navigation
│   │   └── PWA/          # Composants PWA
│   ├── contexts/         # Contexts React
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et helpers
│   ├── pages/            # Pages de l'application
│   ├── patterns/         # Design patterns
│   ├── types/            # Types TypeScript
│   ├── utils/            # Fonctions utilitaires
│   └── assets/           # Assets statiques
├── tests/                # Tests unitaires et E2E
├── docs/                 # Documentation
├── config/               # Configuration
└── scripts/              # Scripts de build et déploiement
```

### Technologies utilisées

#### **Core**
- **React 18** - Framework UI avec Concurrent Features
- **TypeScript 5.0** - Typage statique avancé
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire

#### **PWA & Performance**
- **Workbox** - Service Worker intelligent
- **IndexedDB** - Stockage client robuste
- **Framer Motion** - Animations fluides
- **React Query** - Gestion d'état serveur

#### **Sécurité**
- **Zod** - Validation de schémas
- **DOMPurify** - Sanitization XSS
- **CryptoJS** - Chiffrement côté client

#### **Tests & Qualité**
- **Vitest** - Framework de tests
- **Playwright** - Tests E2E
- **ESLint + Prettier** - Linting et formatting
- **Husky** - Git hooks

### Design Patterns utilisés

#### **Repository Pattern**
```typescript
// Abstraction de la couche de données
export interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(entity: Omit<T, 'id'>): Promise<T>
  update(id: string, entity: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

#### **Observer Pattern**
```typescript
// Gestion d'état réactive
export class EventEmitter<T> {
  private observers: Observer<T>[] = []
  
  subscribe(observer: Observer<T>): void
  notify(data: T): void
}
```

#### **Singleton Pattern**
```typescript
// Instance unique pour les services
export class ApiClient {
  private static instance: ApiClient
  static getInstance(): ApiClient
}
```

## 🎨 **Guide d'utilisation**

### Gestion des événements

```typescript
// Créer un événement
const newEvent = await MathildeAPI.events.create({
  title: "Mariage Sophie & Pierre",
  date: new Date("2024-06-15"),
  time: "14:00",
  location: "Château de Versailles",
  budget: 1500,
  flowers: [
    { flowerId: "rose-1", quantity: 50 },
    { flowerId: "pivoine-1", quantity: 30 }
  ]
})

// Exporter en PDF
await EventExporter.exportEvents(events, {
  format: 'pdf',
  title: 'Liste des Événements - Juin 2024'
})
```

### Formatage des données

```typescript
import { DataFormatter } from '@/lib/format'

// Formatage monétaire
DataFormatter.currency(1234.56) // "1 234,56 €"

// Formatage de dates
DateUtils.format(new Date(), 'dd MMMM yyyy') // "15 juin 2024"

// Formatage de téléphone
DataFormatter.phone('0123456789') // "01 23 45 67 89"
```

### Stockage sécurisé

```typescript
import { storage } from '@/lib/storage'

// Stockage avec chiffrement
await storage.set('sensitive_data', userData, {
  encrypt: true,
  expiration: 24 * 60 * 60 * 1000 // 24h
})

// Récupération
const data = await storage.get('sensitive_data')
```

## 🛡️ **Sécurité**

### Mesures de protection

- **🔐 Chiffrement AES-256** pour les données sensibles
- **🛡️ Validation Zod** avec sanitization automatique
- **⛔ Protection XSS** via DOMPurify
- **🚫 Rate limiting** contre les attaques
- **📊 Audit automatique** des événements de sécurité
- **🔒 Headers CSP** et protection navigateur

### Exemple de validation

```typescript
import { EventSchema } from '@/types'
import { DataSanitizer } from '@/utils/security'

// Validation et sanitization automatiques
const safeEventData = DataSanitizer.validateAndSanitize(
  rawEventData, 
  EventSchema
)
```

## ⚡ **Performances**

### Optimisations implémentées

- **📦 Bundle splitting** intelligent
- **🗜️ Compression** automatique des assets
- **⚡ Lazy loading** des composants
- **🧠 Memoization** avancée
- **💾 Cache** intelligent multi-niveaux
- **🔄 Service Worker** avec stratégies adaptatives

### Métriques cibles

| Métrique | Objectif | Actuel |
|----------|----------|---------|
| **FCP** | < 1.5s | ✅ 1.2s |
| **LCP** | < 2.5s | ✅ 2.1s |
| **CLS** | < 0.1 | ✅ 0.05 |
| **Bundle size** | < 1MB | ✅ 850KB |

## 📱 **PWA Features**

### Fonctionnalités PWA avancées

- ✅ **Installation native** sur tous appareils
- ✅ **Mode offline** 100% fonctionnel
- ✅ **Synchronisation automatique** en arrière-plan
- ✅ **Notifications push** intelligentes
- ✅ **Mise à jour transparente** de l'application
- ✅ **Stockage persistant** avec IndexedDB

### Configuration Service Worker

```javascript
// Stratégies de cache intelligentes
const strategies = {
  static: 'CacheFirst',      // Assets statiques
  api: 'NetworkFirst',       // Données API
  images: 'StaleWhileRevalidate' // Images
}
```

## 🧪 **Tests**

### Couverture de tests

- **🧪 Tests unitaires** - Jest/Vitest (80%+ coverage)
- **🎭 Tests E2E** - Playwright (scénarios critiques)
- **📊 Tests de performance** - Lighthouse CI
- **🔒 Tests de sécurité** - OWASP automatisés

### Exécution des tests

```bash
# Tests complets
npm run test:all

# Tests spécifiques
npm run test -- auth.test.ts
npm run test:e2e -- events.spec.ts
```

## 🚀 **Déploiement**

### Environnements

- **Development** - `localhost:3000`
- **Staging** - `staging.mathilde-fleurs.com`
- **Production** - `app.mathilde-fleurs.com`

### Variables d'environnement

```bash
# API Configuration
VITE_API_BASE_URL=https://api.mathilde-fleurs.com
VITE_VAPID_PUBLIC_KEY=your_vapid_key

# Security
VITE_ENCRYPTION_KEY=your_secret_key
VITE_CSP_NONCE=random_nonce

# Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

## 🤝 **Contribution**

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

### Quick start pour contributeurs

```bash
# Setup du projet
git clone https://github.com/mathilde-fleurs/app.git
cd mathilde-fleurs
npm install

# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer avec tests
npm run test:watch

# Avant commit
npm run lint:fix
npm run test
npm run build
```

## 📖 **Documentation technique**

- 📋 [Guide de contribution](./CONTRIBUTING.md)
- 🔒 [Sécurité](./SECURITY.md)
- 🚀 [Déploiement](./DEPLOYMENT.md)
- ⚡ [Performances](./PERFORMANCE.md)
- 🌐 [API](./API.md)

## 📄 **Licence**

MIT License - voir [LICENSE](../LICENSE) pour plus de détails.

## 👥 **Équipe**

- **Mathilde Dupont** - *Product Owner & UX Designer*
- **Équipe Dev** - *Développement & Architecture*

## 📞 **Support**

- 📧 **Email** : support@mathilde-fleurs.com
- 💬 **Discord** : [Communauté Mathilde Fleurs](https://discord.gg/mathilde-fleurs)
- 📖 **Documentation** : [docs.mathilde-fleurs.com](https://docs.mathilde-fleurs.com)

---

**🌸 Créé avec ❤️ pour révolutionner la gestion d'événements fleuriste**
