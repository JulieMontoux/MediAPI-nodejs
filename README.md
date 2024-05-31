# MediAPI

## Base de données

### Installation de la base de données

Pour installer la base de données, suivez les étapes ci-dessous :

1. **Créer la base de données et les tables :**

    Exécutez le script SQL pour créer les tables nécessaires dans votre base de données SQLite.

    ```bash
    sqlite3 mediapi.db < data/Bibliothèque.sql
    ```

2. **Insérer les données initiales :**

    Exécutez le script SQL pour insérer les données de départ dans votre base de données.

    ```bash
    sqlite3 mediapi.db < data/seed.sql
    ```

Ces commandes doivent être exécutées dans un terminal à partir de la racine du projet. Assurez-vous que les fichiers `Bibliothèque.sql` et `seed.sql` se trouvent dans le dossier `data`.

### Description des fichiers SQL

- **Bibliothèque.sql :** Ce fichier contient les commandes SQL pour créer les tables de la base de données.
- **seed.sql :** Ce fichier contient les commandes SQL pour insérer les données initiales dans les tables.
