# Frontend - DZShop

## Objectif

Cette application React fournit:

- L experience utilisateur e-commerce
- La navigation des produits et boutiques
- Le panier et la creation des commandes
- Les dashboards admin et shopAdmin

## Stack frontend

- React 18
- React Router
- Axios
- React Context API
- React Hot Toast
- React Icons
- CSS

## Dossiers principaux

- src/components/: composants reutilisables
- src/screens/: pages applicatives (home, produits, admin, etc.)
- src/context/: gestion de l etat global
- src/api.js: client HTTP centralise

## Roles supportes dans l UI

- client: parcours achat, panier, commandes
- shopAdmin: dashboard boutique et produits
- generalAdmin: dashboard global + supervision des commandes

## Commandes

- npm install
- npm start
- npm run build

## Variables d environnement

- REACT_APP_API_URL (optionnel)

Exemple:

- REACT_APP_API_URL=http://localhost:5001/api

## Notes rapport

Captures recommandees pour le PDF:

- Ecran Home
- Ecran produits
- Dashboard generalAdmin
- Dashboard shopAdmin
- Fichier src/components/ProtectedRoute.js
- Fichiers src/context/*.js
