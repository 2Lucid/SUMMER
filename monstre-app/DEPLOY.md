# Déployer MONSTRE (PWA installable sur ton tel)

L'app est un site statique auto-suffisant (`base: './'`). `npm run build` produit `dist/`,
déployable partout. Ta sauvegarde Supabase est identique à l'ancienne version HTML : ta
progression est reprise automatiquement.

## Le plus simple — Vercel (recommandé)
```bash
npm i -g vercel      # une fois
vercel               # 1re fois : login + questions → URL de preview
vercel --prod        # met en ligne l'URL définitive
```

## Netlify (glisser-déposer, zéro compte requis pour tester)
```bash
npm run build
```
puis dépose le dossier `dist/` sur https://app.netlify.com/drop

## GitHub Pages
`npm run build`, pousse le repo, active Pages sur le dossier `dist` (ou via une action).

## Installer sur le téléphone
Ouvre l'URL (https) dans Safari/Chrome → menu Partager → « Sur l'écran d'accueil ».
Elle s'installe comme une vraie app (icône 👹, plein écran, marche hors-ligne).

## Tester en local
```bash
npm run dev       # http://localhost:5173
npm run preview   # sert le build de prod
```
