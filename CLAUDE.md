# Instructions Claude Code - Mathilde Fleurs

## 🚨 PREMIÈRE ACTION À CHAQUE NOUVELLE SESSION

> **AVANT TOUTE CHOSE, LIRE LE FICHIER `CLAUDE_SESSION_TRACKER.md`**
>
> Ce fichier contient :
> - L'état actuel du projet
> - L'historique des sessions précédentes
> - Les tâches à faire (section "TÂCHES EN ATTENTE")
> - Les tâches terminées
>
> **OBLIGATOIRE : Lire ce fichier et faire un résumé à l'utilisateur de l'état du projet.**

---

## 🔄 WORKFLOW OBLIGATOIRE POUR CHAQUE MODIFICATION

### AVANT de modifier le code :
1. Lire `CLAUDE_SESSION_TRACKER.md`
2. Ajouter la tâche dans la section "TÂCHES EN ATTENTE" avec statut 🔄
3. Commit : `git add CLAUDE_SESSION_TRACKER.md && git commit -m "docs: début tâche - [description]" && git push`

### APRÈS avoir modifié le code :
1. Tester : `npm run build`
2. Mettre à jour `CLAUDE_SESSION_TRACKER.md` :
   - Déplacer la tâche de "EN ATTENTE" vers "HISTORIQUE DES SESSIONS"
   - Marquer comme ✅
3. Commit tout : `git add -A ':!nul' && git commit -m "[description]" && git push`
   - Si erreur avec ':!nul', utiliser : `git add [fichiers modifiés]`

### Format des commits :
- `fix:` pour les corrections de bugs
- `feat:` pour les nouvelles fonctionnalités
- `docs:` pour la documentation

---

## RÈGLE ABSOLUE N°1 : NE PAS CASSER L'EXISTANT

> **NE JAMAIS PERTURBER LE BON FONCTIONNEMENT DE L'APPLICATION EXISTANTE**
>
> Avant chaque modification :
> 1. Comprendre le code existant
> 2. Tester que l'app fonctionne avant de modifier
> 3. Faire des modifications incrémentales
> 4. Tester après chaque modification
> 5. Si quelque chose casse → revenir en arrière immédiatement

## RÈGLE ABSOLUE N°2 : DOCUMENTATION ET PUSH OBLIGATOIRES

> **APRÈS CHAQUE INTERVENTION, METTRE À JOUR LA DOCUMENTATION ET PUSHER SUR GITHUB**
>
> Cette règle est **NON-NÉGOCIABLE**. À la fin de CHAQUE action (bug fix, fonctionnalité, modification) :
>
> 1. **Mettre à jour `CLAUDE_SESSION_TRACKER.md`** avec ce qui a été fait
> 2. **Commit avec message descriptif**
> 3. **Push sur GitHub**
>
> **Pourquoi ?** Pour que n'importe qui puisse reprendre le travail à tout moment.

---

## CHECKLIST DE FIN D'INTERVENTION (OBLIGATOIRE)

À exécuter **SYSTÉMATIQUEMENT** avant de terminer une session ou après chaque tâche significative :

```bash
# 1. Vérifier que le build passe
npm run build

# 2. Mettre à jour la documentation (CLAUDE_SESSION_TRACKER.md)
#    - Ajouter/mettre à jour l'historique de session
#    - Mettre à jour les statuts des tâches
#    - Mettre à jour la date

# 3. Commit et push
git add -A ':!nul'
git commit -m "Description de ce qui a été fait"
git push
```

**Si le push échoue** → Résoudre le problème AVANT de terminer.

---

## IMPORTANT : À faire en début de chaque session

Avant de commencer toute tâche sur ce projet :

1. **Lire le fichier de suivi** : `CLAUDE_SESSION_TRACKER.md`
2. **Consulter l'état d'avancement global** dans la section "Nouvelles fonctionnalités"
3. **Identifier la prochaine tâche ⬜** non traitée (bugs OU fonctionnalités)
4. **Mettre à jour le tracker** après chaque tâche (⬜ → ✅)
5. **Mettre à jour la progression** (ex: "2/5" → "3/5")
6. **Mettre à jour la date** de dernière modification

## Règles de mise à jour

Après chaque intervention :

1. Modifier `CLAUDE_SESSION_TRACKER.md` :
   - Changer le statut de la tâche : `⬜` → `✅`
   - Mettre à jour la progression (ex: "A - Vue profil client | 1/5")
   - Mettre à jour le total global (ex: "Total : 3/25 tâches (12%)")
   - Ajouter une entrée dans "Historique des sessions"
   - Mettre à jour la date en haut du fichier

2. Si nouveaux bugs découverts :
   - Les ajouter dans la phase appropriée
   - Incrémenter le compteur total

3. Format de l'historique :
```markdown
### Session X - [DATE]
- ✅ Bug #X corrigé : [description courte]
- ✅ Tâche A1 terminée : [description courte]
- 🔍 Nouveau bug découvert : [description]
```

## Protocole de test OBLIGATOIRE

**TESTER SYSTÉMATIQUEMENT après chaque modification :**

1. `npm run type-check` → Aucune erreur TypeScript sur les fichiers modifiés
2. `npm run build` → Build réussi
3. Test manuel des fonctionnalités impactées
4. Vérifier que les fonctionnalités existantes marchent toujours

**⚠️ SI UN TEST ÉCHOUE → CORRIGER IMMÉDIATEMENT AVANT DE CONTINUER**

Ne jamais passer à la tâche suivante si :
- Le type-check montre des erreurs sur les fichiers modifiés
- Le build échoue
- Une fonctionnalité existante est cassée

## RÈGLE CRITIQUE : Validation avant progression

> **S'ASSURER QUE TOUT FONCTIONNE BIEN ET SOIT BIEN TESTÉ AVANT DE PASSER AUX ÉTAPES SUIVANTES**
>
> Cette règle est NON-NÉGOCIABLE. Avant de marquer une fonctionnalité comme terminée :
>
> 1. **Vérifier TypeScript** : `npx tsc --noEmit` sur les fichiers créés/modifiés
> 2. **Vérifier le build** : `npm run build` doit passer (ignorer les erreurs pré-existantes non liées)
> 3. **Tester manuellement** : Lancer `npm run dev` et vérifier visuellement que la fonctionnalité marche
> 4. **Tester l'intégration** : S'assurer que les nouvelles fonctionnalités n'ont pas cassé l'existant
> 5. **Documenter les tests** : Noter ce qui a été testé dans le tracker
>
> **Si une fonctionnalité ne peut pas être testée ou validée → NE PAS la marquer comme terminée**

## Contexte technique

- **Stack** : React 18 + TypeScript + Vite + Tailwind CSS
- **État global** : Context API (AppContext)
- **Persistance** : localStorage
- **PWA** : Service Worker + Workbox

## Fichiers critiques

| Fichier | Rôle |
|---------|------|
| `src/contexts/AppContext.tsx` | État global, CRUD événements/clients |
| `src/components/events/EventModal.tsx` | Modal événements (1200+ lignes) |
| `src/hooks/useBillingWorkflow.ts` | Logique facturation |
| `src/hooks/useAutoStatusTransition.ts` | Transitions auto de statut |
| `src/utils/validation.ts` | Schémas Zod |
| `src/types/index.ts` | Types globaux |

## Commandes

```bash
npm run dev          # Développement
npm run build        # Production
npm run type-check   # Vérification TypeScript
npm run test         # Tests unitaires
npm run lint         # Linting
```

## Principe de correction

1. **Ne pas casser l'existant** - Toujours tester après correction
2. **Une correction = un commit** - Commits atomiques
3. **Documenter** - Mettre à jour le tracker après chaque fix
