# 🤝 Guide de Contribution - Mathilde Fleurs

> **Guide complet pour contribuer au projet Mathilde Fleurs**

Merci de vouloir contribuer à Mathilde Fleurs ! Ce guide détaille comment participer efficacement au développement de cette PWA de gestion d'événements fleuriste.

## 🎯 **Aperçu du projet**

Mathilde Fleurs est une **Progressive Web App (PWA)** moderne construite avec :
- **React 18 + TypeScript** - Interface utilisateur réactive
- **Vite** - Build tool ultra-rapide  
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations fluides
- **Workbox** - Service Worker intelligent

## 🚀 **Quick Start pour contributeurs**

### 1. Configuration initiale

```bash
# Fork et clone du projet
git clone https://github.com/YOUR_USERNAME/mathilde-fleurs.git
cd mathilde-fleurs

# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env

# Démarrage en mode développement
npm run dev
```

### 2. Vérification de l'environnement

```bash
# Tests
npm run test

# Linting
npm run lint

# Build
npm run build
```

## 📋 **Standards de développement**

### Architecture

- **🏗️ Structure modulaire** - Un fichier = une responsabilité
- **🎯 Design patterns** - Repository, Observer, Singleton
- **📱 Mobile-first** - Responsive design prioritaire
- **♿ Accessibilité** - WCAG 2.1 AA minimum

### Code Style

```typescript
// ✅ Bon exemple
interface Event {
  id: string
  title: string
  date: Date
  client: Client
}

const createEvent = async (data: CreateEventData): Promise<Event> => {
  const validated = EventSchema.parse(data)
  return await eventRepository.create(validated)
}

// ❌ Mauvais exemple
function createEvent(data: any) {
  return eventRepository.create(data) // Pas de validation
}
```

### Conventions de nommage

```typescript
// Fichiers
├── MyComponent.tsx        # PascalCase pour composants
├── useMyHook.ts          # camelCase pour hooks
├── my-utility.ts         # kebab-case pour utilitaires
└── constants.ts          # lowercase pour configs

// Variables et fonctions
const userName = 'sophie'           // camelCase
const MAX_EVENTS = 100             // SCREAMING_SNAKE_CASE pour constantes
const handleSubmit = () => {}      // camelCase pour fonctions

// Types et interfaces
interface User {}                  // PascalCase
type EventStatus = 'draft' | 'confirmed'  // PascalCase
```

## 🔄 **Workflow de contribution**

### 1. Création d'une branche

```bash
# Branches feature
git checkout -b feature/nouvelle-fonctionnalite

# Branches bugfix
git checkout -b fix/correction-bug

# Branches hotfix
git checkout -b hotfix/securite-critique
```

### 2. Convention des commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Types de commits
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, point-virgules manquants
refactor: refactoring du code
test: ajout de tests
chore: maintenance

# Exemples
git commit -m "feat(events): ajouter filtre par date"
git commit -m "fix(auth): corriger la validation email"
git commit -m "docs(api): documenter les endpoints clients"
git commit -m "test(components): ajouter tests Button"
```

### 3. Pull Request

```markdown
## 📝 Description
Brève description des changements apportés.

## 🎯 Type de changement
- [ ] Bug fix (changement qui corrige un problème)
- [ ] New feature (changement qui ajoute une fonctionnalité)
- [ ] Breaking change (correction ou fonctionnalité qui casserait la compatibilité)
- [ ] Documentation update

## 🧪 Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour
- [ ] Tests manuels effectués

## 📋 Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté mon code, en particulier les parties complexes
- [ ] J'ai mis à jour la documentation correspondante
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction/fonctionnalité fonctionne
- [ ] Les tests unitaires et d'intégration passent localement
```

## 🧪 **Standards de tests**

### Coverage requis

- **Minimum** : 80% coverage global
- **Composants UI** : 85%+ coverage
- **Utilitaires/Logic** : 90%+ coverage
- **Hooks** : 85%+ coverage

### Types de tests

```typescript
// 1. Tests unitaires (Jest/Vitest)
describe('DataFormatter', () => {
  it('devrait formater une devise correctement', () => {
    expect(currency(1234.56)).toBe('1 234,56 €')
  })
})

// 2. Tests de composants (React Testing Library)
describe('Button Component', () => {
  it('devrait déclencher onClick', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})

// 3. Tests E2E (Playwright)
test('devrait créer un nouvel événement', async ({ page }) => {
  await page.goto('/events/new')
  await page.fill('input[name="title"]', 'Test Event')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('h1')).toContainText('Test Event')
})
```

### Commandes de test

```bash
# Tests unitaires
npm run test                    # Exécution simple
npm run test:watch              # Mode watch
npm run test:coverage           # Avec coverage

# Tests E2E
npm run test:e2e               # Tous navigateurs
npm run test:e2e:chrome        # Chrome uniquement
npm run test:e2e:headed        # Avec interface graphique

# Tests spécifiques
npm run test -- Button.test.tsx
npm run test:e2e -- auth.spec.ts
```

## 🔒 **Sécurité**

### Validation des entrées

```typescript
// ✅ Toujours valider avec Zod
const EventSchema = z.object({
  title: z.string().min(1).max(100),
  email: z.string().email()
})

const createEvent = (data: unknown) => {
  const validated = EventSchema.parse(data) // Throw si invalide
  return eventRepository.create(validated)
}
```

### Sanitization

```typescript
// ✅ Sanitizer les entrées utilisateur
import { DataSanitizer } from '@/utils/security'

const title = DataSanitizer.sanitizeString(userInput)
```

### Secrets et configuration

```bash
# ✅ Variables d'environnement
VITE_API_BASE_URL=https://api.mathilde-fleurs.com
VITE_ENCRYPTION_KEY=your-secret-key

# ❌ Jamais dans le code
const API_KEY = "sk_live_abcd1234" // INTERDIT
```

## 📱 **PWA Guidelines**

### Service Worker

```typescript
// ✅ Stratégies de cache appropriées
const strategies = {
  static: 'CacheFirst',      // CSS, JS, images
  api: 'NetworkFirst',       # Données API
  documents: 'StaleWhileRevalidate' // HTML
}
```

### Mode offline

```typescript
// ✅ Gérer les états offline
const { isOnline } = useOnlineStatus()

if (!isOnline) {
  // Stocker pour sync ultérieure
  await offlineStorage.queue(action)
}
```

## ♿ **Accessibilité**

### Standards requis

- **WCAG 2.1 AA** compliance
- **Contraste** minimum 4.5:1
- **Navigation clavier** complète
- **Screen readers** supportés

### Exemples

```tsx
// ✅ Bon exemple
<button
  aria-label="Fermer la modal"
  onClick={onClose}
  className="focus:ring-2 focus:ring-primary-500"
>
  <X className="w-4 h-4" />
</button>

// ✅ Formulaires accessibles
<label htmlFor="email" className="sr-only">
  Adresse email
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-help"
  aria-invalid={!!error}
/>
{error && (
  <div id="email-help" role="alert">
    {error}
  </div>
)}
```

## 🎨 **UI/UX Guidelines**

### Design System

```tsx
// ✅ Utiliser les composants du design system
import { Button, Input, Card } from '@/components/ui'

// Couleurs
const colors = {
  primary: 'bg-primary-500',    // Vert Mathilde Fleurs
  secondary: 'bg-secondary-500', // Rose/Magenta
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
}
```

### Animations

```tsx
// ✅ Animations fluides avec Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Contenu
</motion.div>
```

### Responsive Design

```tsx
// ✅ Mobile-first avec Tailwind
<div className="
  w-full 
  px-4 sm:px-6 lg:px-8 
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 lg:gap-6
">
```

## 📊 **Performance**

### Métriques cibles

| Métrique | Cible | Critique |
|----------|-------|----------|
| FCP | < 1.5s | < 2.5s |
| LCP | < 2.5s | < 4.0s |
| CLS | < 0.1 | < 0.25 |
| FID | < 100ms | < 300ms |

### Optimisations

```typescript
// ✅ Lazy loading des composants
const EventDetails = lazy(() => import('./EventDetails'))

// ✅ Memoization appropriée
const ExpensiveComponent = memo(({ data }) => {
  const memoizedValue = useMemo(() => 
    heavyComputation(data), [data]
  )
  
  return <div>{memoizedValue}</div>
})

// ✅ Hooks optimisés
const debouncedSearch = useDebounce(searchTerm, 300)
```

## 🔧 **Debugging**

### Outils recommandés

```bash
# React DevTools
# Redux DevTools (si utilisé)
# Lighthouse pour PWA
# Chrome DevTools

# Debug en développement
console.log('🐛 Debug:', data)
console.time('⏱️ Performance')
console.timeEnd('⏱️ Performance')
```

### Logs

```typescript
// ✅ Logs structurés
import { logger } from '@/utils/logger'

logger.info('Event created', { eventId, userId })
logger.error('API Error', { error, context })
logger.debug('Debug info', { data })
```

## 🚀 **Déploiement**

### Environnements

```bash
# Développement
npm run dev

# Staging
npm run build
npm run deploy:staging

# Production
npm run build
npm run deploy:prod
```

### Checklist pré-déploiement

- [ ] Tests passent (unitaires + E2E)
- [ ] Build sans erreurs
- [ ] Audit sécurité clean
- [ ] Performance vérifiée
- [ ] Accessibilité testée
- [ ] PWA audit OK

## 📞 **Support et Communication**

### Channels de communication

- 💬 **Discord** : [Lien vers Discord]
- 📧 **Email** : dev@mathilde-fleurs.com
- 🐛 **Issues** : GitHub Issues
- 📖 **Documentation** : [docs.mathilde-fleurs.com]

### Questions fréquentes

**Q: Comment ajouter une nouvelle page ?**
A: Créer le composant dans `src/pages/`, ajouter la route dans le router, et les tests correspondants.

**Q: Comment ajouter un nouveau composant UI ?**
A: Créer dans `src/components/ui/`, suivre le pattern des composants existants, ajouter les tests et la documentation.

**Q: Comment debugger les tests E2E ?**
A: Utiliser `npm run test:e2e:headed` pour voir les tests s'exécuter ou `--debug` pour le mode debug.

## 🏆 **Recognition**

Nous reconnaissons nos contributeurs ! Chaque contribution sera :
- ✅ Créditée dans le CHANGELOG
- ✅ Mentionnée dans les releases
- ✅ Ajoutée au hall of fame des contributeurs

## 📚 **Ressources utiles**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

---

**🌸 Merci de contribuer à Mathilde Fleurs ! Ensemble, créons la meilleure PWA de gestion d'événements fleuriste.**
