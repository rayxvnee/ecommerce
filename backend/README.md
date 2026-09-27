# Backend - DZShop

## Objectif

Le backend expose une API REST pour:

- Authentification JWT
- Gestion des boutiques
- Gestion des produits
- Gestion des commandes
- Gestion newsletter

## Technologies

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs
- cors
- morgan
- express-async-handler

## Structure

- controllers/: logique metier
- routes/: definition des endpoints API
- models/: schemas MongoDB
- middleware/: auth, autorisation, erreurs
- services/: services transverses (email)
- server.js: point d entree application

## Endpoints principaux

- /api/auth
- /api/shops
- /api/products
- /api/orders
- /api/marketing

## Securite et controle d acces

- Authentification par token Bearer (JWT)
- Autorisation par roles:
  - client
  - shopAdmin
  - generalAdmin
- Middleware global de gestion d erreurs
- CORS controle par whitelist

## Lancement

1. npm install
2. configurer .env
3. npm run dev

Variables minimales:

- MONGO_URI
- JWT_SECRET
- PORT (optionnel)
- NODE_ENV (optionnel)
