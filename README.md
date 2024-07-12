# MediAPI

## Sujet

- [x] Mise en place d’une API en NodeJS + ExpressJS écoutant sur le port 8000
- [x] Sécurisation via API Key
- [ ] Validation des modifications via ETag
- [ ] 14 points d’entrée (attention corps de requêtes !)
- [x] Recherche

### Livres

- [x] **GET /livre** : Retourne la liste des livres avec les informations des auteurs.
- [x] **GET /livre/{id}** : Retourne la fiche du livre portant l’ID indiquée, avec les informations des auteurs associés.
- [x] **POST /livre** : Crée le livre selon les informations du corps de la requête. Les auteurs sont fournis par leurs IDs. La quantité en stock est initialisée à 1 si elle n’est pas fournie. Retourne une erreur si un auteur n’existe pas.
- [ ] **PUT /livre/{id}** : Modifie le livre selon les informations du corps de la requête. Les auteurs sont fournis par leurs IDs. La quantité en stock n’est pas modifiable. Retourne une erreur si un auteur n’existe pas.
- [x] **GET /livre/{id}/quantite** : Retourne la quantité totale et la quantité disponible pour le livre. Quantité disponible = quantité totale - nombre d’emprunts en cours.
- [ ] **PUT /livre/{id}/quantite** : Modifie la quantité totale pour le livre. Retourne une erreur si la nouvelle quantité est inférieure au nombre d’emprunts actuellement en cours.
- [x] **DELETE /livre/{id}** : Supprime le livre. Retourne une erreur si des emprunts sont en cours

### Auteurs

- [x] **GET /auteur** : Retourne la liste des auteurs.
- [x] **GET /auteur/{id}** : Retourne la fiche de l’auteur portant l’ID indiquée.
- [x] **POST /auteur** : Crée l’auteur selon les informations du corps de la requête.
- [x] **PUT /auteur/{id}** : Modifie l’auteur selon les informations du corps de la requête.
- [x] **DELETE /auteur/{id}** : Supprime l’auteur. Retourne une erreur si l’auteur est utilisé par un ou plusieurs livres.

### Emprunts

- [x] **POST /emprunt** : Crée un emprunt selon les informations du corps de la requête. Le livre est choisi par son ID. La date d’emprunt est remplie automatiquement à la date du jour. Les informations de l’emprunteur permettent de le créer dans la table personnes s’il n’existe pas ou de le modifier s’il existe déjà (identification via l’email). Retourne une erreur si le le livre n’est pas empruntable (quantité disponible = zéro)
- [x] **PUT /emprunt/{id}** : Modifie l’emprunt (remplis la date de retour)

### Recherche

- [x] **GET /recherche/{mots}** : Recherche des livres selon les mots fournis parmi le titre et le nom/prénom de l’auteur. Les résultats sont classés par taux de correspondance (à taux de correspondance égal, l’ordre n’a pas d’importance) Exemple : la recherche “hugo misérables” retournera le livre “Les Misérables” de Victor Hugo, puis l’ensemble des livres de Victor Hugo (peu importe leur ordre)

## Base de données

### Installation de la base de données

Pour installer la base de données, suivez les étapes ci-dessous :

1. **Créer la base de données et les tables :**

    Exécutez le script SQL pour créer les tables nécessaires dans votre base de données SQLite.

    ```bash
    cd data
    sqlite3 mediapi.db < Bibliothèque.sql
    ```

2. **Insérer les données initiales :**

    Exécutez le script SQL pour insérer les données de départ dans votre base de données.

    ```bash
    sqlite3 mediapi.db < seed.sql
    ```

Ces commandes doivent être exécutées dans un terminal à partir de la racine du projet. Assurez-vous que les fichiers `Bibliothèque.sql` et `seed.sql` se trouvent dans le dossier `data`.

### Description des fichiers SQL

- **Bibliothèque.sql :** Ce fichier contient les commandes SQL pour créer les tables de la base de données.
- **seed.sql :** Ce fichier contient les commandes SQL pour insérer les données initiales dans les tables.
