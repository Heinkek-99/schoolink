# SchoolInk

Interface web de gestion scolaire. Elle couvre les élèves, les familles, les paiements et le
tableau de bord, et consomme une API REST côté serveur.

## Fonctionnalités

- Authentification et gestion de session (module `auth.api.ts`)
- Tableau de bord et recherche globale
- Élèves, familles, paiements : listes, formulaires et écrans de détail
- Panneau de notifications et mise en page responsive

## Stack

React avec TypeScript et Vite, Tailwind CSS et composants Radix UI, TanStack Query pour les appels
réseau, axios pour le client HTTP, React Router pour la navigation, Vitest pour les tests.

## Structure

- `src/api/` : accès à l'API (auth, dashboard, eleves, familles, paiements, configuration axios)
- `src/components/` : composants partagés, mise en page, notifications
- `src/pages/` : écrans de l'application
- `src/hooks/`, `src/lib/`, `src/utils/` : logique réutilisable, dont la génération de documents PDF

## Lancer le projet

```bash
npm install
npm run dev
```

Tests et build :

```bash
npm run test
npm run build
```

L'URL de l'API se configure dans `src/api/axios.config.ts`.

## État

Interface fonctionnelle sur les écrans principaux. Le dépôt n'avait pas de description, ce fichier
la remplace. Même domaine fonctionnel que le projet `SchoolFlow`, qui porte l'API et le client
desktop.
