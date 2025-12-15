# BMAD-METHOD v6 pour Mathilde App

## Installation

**BMAD-METHOD v6.0.0-alpha.16 installe !**

### Localisation
- **Projet**: `C:\Users\Bill\Desktop\mathilde-app-version-telephone\`
- **Core**: `bmad-core/`
- **Agents**: `.claude/agents/`

---

## Agents Principaux (bmad-core/agents/)

| Agent | Fichier | Role |
|-------|---------|------|
| **Analyst** | `analyst.agent.yaml` | Analyse des besoins |
| **Architect** | `architect.agent.yaml` | Architecture technique |
| **Dev** | `dev.agent.yaml` | Developpement |
| **PM** | `pm.agent.yaml` | Product Manager |
| **SM** | `sm.agent.yaml` | Scrum Master |
| **UX Designer** | `ux-designer.agent.yaml` | UX/UI |
| **Tech Writer** | `tech-writer.agent.yaml` | Documentation |
| **TEA** | `tea.agent.yaml` | Test Engineering |
| **Quick Flow** | `quick-flow-solo-dev.agent.yaml` | Dev rapide solo |

---

## Subagents Claude Code (.claude/agents/)

### bmad-analysis/
- `api-documenter.md` - Documentation API
- `codebase-analyzer.md` - Analyse de code
- `data-analyst.md` - Analyse de donnees
- `pattern-detector.md` - Detection de patterns

### bmad-planning/
- `dependency-mapper.md` - Mapping dependances
- `epic-optimizer.md` - Optimisation epics
- `requirements-analyst.md` - Analyse requirements
- `technical-decisions-curator.md` - Decisions techniques
- `trend-spotter.md` - Detection tendances
- `user-journey-mapper.md` - Parcours utilisateur
- `user-researcher.md` - Recherche utilisateur

### bmad-research/
- `market-researcher.md` - Etude de marche
- `tech-debt-auditor.md` - Audit dette technique

### bmad-review/
- `document-reviewer.md` - Revue de documents
- `technical-evaluator.md` - Evaluation technique
- `test-coverage-analyzer.md` - Analyse couverture tests

---

## Workflows Disponibles (bmad-core/workflows/)

### 1-analysis/
- `create-product-brief/` - Creer brief produit
- `research/` - Recherche (market, domain, technical)

### 2-plan-workflows/
- `create-ux-design/` - Design UX
- `prd/` - Product Requirements Document

### 3-solutioning/
- `check-implementation-readiness/` - Verification pret a dev
- `create-architecture/` - Creation architecture
- `create-epics-and-stories/` - Epics et stories

### 4-implementation/
- `code-review/` - Revue de code
- `correct-course/` - Correction de cap
- `create-story/` - Creer story
- `dev-story/` - Developper story
- `retrospective/` - Retrospective
- `sprint-planning/` - Planning sprint
- `sprint-status/` - Statut sprint

### bmad-quick-flow/
- `create-tech-spec/` - Spec technique rapide
- `quick-dev/` - Dev rapide

---

## Commandes Slash BMAD

Utilisez le prefixe `/bmad:` pour les commandes BMAD :

```
/bmad:brainstorm     - Session de brainstorming
/bmad:prd            - Creer PRD
/bmad:architecture   - Creer architecture
/bmad:story          - Creer story
/bmad:dev            - Developper
/bmad:review         - Revue de code
```

---

## Sources

- [BMAD-METHOD Official](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD for Claude Code](https://github.com/24601/BMAD-AT-CLAUDE)
- Version: v6.0.0-alpha.16
