# Dossier controllers

Ce dossier contient la logique metier de l API:

- authController.js: inscription, login, profil courant
- shopController.js: CRUD boutiques
- productController.js: CRUD produits, recherche, recommandations, avis
- orderController.js: creation commandes, historique, suivi statut
- marketingController.js: inscription newsletter

Role architectural:

- Recoit les requetes HTTP via routes
- Applique les regles metier
- Dialogue avec les modeles Mongoose
