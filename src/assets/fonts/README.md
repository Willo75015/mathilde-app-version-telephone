# Inter Variable Font Placeholder

Cette police sera remplacée par la vraie Inter Variable dans un projet réel.
Pour le moment, nous utilisons la police système définie dans Tailwind.

## Instructions pour ajouter Inter Variable :

1. Télécharger Inter Variable depuis https://rsms.me/inter/
2. Placer le fichier `inter-var.woff2` dans ce dossier
3. Importer dans le CSS global :

```css
@font-face {
  font-family: 'Inter var';
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
  src: url('./assets/fonts/inter-var.woff2') format('woff2');
}
```

## Fallback actuel
La configuration Tailwind utilise :
- Inter var (quand disponible)
- Inter
- system-ui
- sans-serif
