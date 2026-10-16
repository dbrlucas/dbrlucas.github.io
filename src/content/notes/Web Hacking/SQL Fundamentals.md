---
titre: "SQL Fundamentals"
description: "Apprendre à écrire des requêtes SQL de base pour récupérer et gérer les données d'une base."
resume: "SQL est le langage des bases de données relationnelles. Cette note présente la structure d'une base, la création des tables, les opérations CRUD, les clauses qui affinent une requête, les opérateurs et les fonctions courantes."
date: "01.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/sqlfundamentals"
---

## Définitions

**Base de données** : système qui stocke, organise et rend accessibles des données de façon structurée.

**SGBD (système de gestion de base de données)** : logiciel qui sert d'interface entre l'utilisateur et la base. MySQL, MariaDB et Oracle Database en sont des exemples.

**SQL (Structured Query Language)** : langage standard qui interroge et manipule les bases de données relationnelles.

**Table** : structure d'une base relationnelle, faite de lignes et de colonnes.

**Clé primaire** : colonne qui identifie de façon unique chaque ligne d'une table.

**Clé étrangère** : colonne qui pointe vers la clé primaire d'une autre table, pour relier les deux.

**Injection SQL (SQLi)** : attaque qui insère du code SQL dans une requête, pour en détourner le résultat ou extraire des données.

## Pourquoi SQL

Les bases de données sont partout en cybersécurité, côté défense pour l'investigation et la détection, côté attaque pour exploiter des failles comme l'injection SQL. Les comprendre aide à sécuriser un système et à analyser un incident.

Il existe deux grandes familles de bases.

| Type | Données | Usage typique |
| --- | --- | --- |
| Relationnelle (SQL) | Structurées en tables liées entre elles | Données cohérentes et fiables, comme des transactions |
| Non relationnelle (NoSQL) | Non tabulaires (documents, clé-valeur) | Données variables et évolutives |

Une base relationnelle est rapide sur de gros volumes, fiable grâce à sa structure stricte, et sa syntaxe proche de l'anglais est simple à apprendre. On la manipule par un SGBD.

## Créer une base et des tables

| Commande | Effet |
| --- | --- |
| `CREATE DATABASE <nom>;` | Crée une base |
| `SHOW DATABASES;` | Liste les bases |
| `USE <nom>;` | Choisit la base active |
| `DROP DATABASE <nom>;` | Supprime une base |
| `SHOW TABLES;` | Liste les tables de la base active |
| `DESCRIBE <table>;` | Affiche la structure d'une table |
| `ALTER TABLE <table> ADD <colonne> <type>;` | Ajoute une colonne |
| `DROP TABLE <table>;` | Supprime une table |

Créer une table demande de définir ses colonnes, leurs types et leurs contraintes. La contrainte `PRIMARY KEY` fixe l'identifiant unique, `NOT NULL` interdit les valeurs vides, et `AUTO_INCREMENT` numérote automatiquement chaque ligne.

```sql
CREATE TABLE livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  date_publication DATE
);
```

Le typage est strict. Une valeur qui ne correspond pas au type de la colonne est refusée.

## Les opérations CRUD

CRUD désigne les quatre opérations de base, Create, Read, Update et Delete.

```sql
-- Create : ajouter une ligne
INSERT INTO livres (titre, date_publication)
VALUES ("Android Security Internals", "2014-10-14");

-- Read : lire des données
SELECT * FROM livres;
SELECT titre, date_publication FROM livres;

-- Update : modifier une ligne
UPDATE livres SET titre = "Nouveau titre" WHERE id = 1;

-- Delete : supprimer une ligne
DELETE FROM livres WHERE id = 1;
```

La clause `WHERE` est essentielle. Sans elle, un `UPDATE` ou un `DELETE` touche toutes les lignes de la table.

## Les clauses

Les clauses affinent le résultat d'un `SELECT`.

| Clause | Effet |
| --- | --- |
| `DISTINCT` | Ne renvoie que les valeurs uniques |
| `GROUP BY` | Regroupe des lignes, pour un calcul par groupe |
| `ORDER BY ... ASC` ou `DESC` | Trie le résultat |
| `HAVING` | Filtre les groupes après agrégation |

`WHERE` filtre les lignes avant le regroupement, `HAVING` filtre les groupes après. C'est leur principale différence.

```sql
SELECT titre, COUNT(*) FROM livres
GROUP BY titre
HAVING titre LIKE '%Hack%';
```

## Les opérateurs

| Opérateur | Rôle |
| --- | --- |
| `LIKE` | Cherche un motif, souvent avec le joker `%` |
| `AND` | Vrai si toutes les conditions sont vraies |
| `OR` | Vrai si au moins une condition est vraie |
| `NOT` | Inverse une condition |
| `BETWEEN` | Vrai si la valeur est dans une plage, bornes comprises |
| `=`, `!=`, `<`, `>`, `<=`, `>=` | Comparent deux valeurs |

```sql
SELECT * FROM livres WHERE titre LIKE "%Android%" OR titre LIKE "%iOS%";
SELECT * FROM livres WHERE id BETWEEN 2 AND 4;
```

## Les fonctions

Deux familles de fonctions reviennent souvent. Les fonctions de chaînes manipulent du texte, les fonctions d'agrégation calculent une valeur sur plusieurs lignes.

| Fonction | Résultat |
| --- | --- |
| `CONCAT(...)` | Assemble plusieurs valeurs en une chaîne |
| `GROUP_CONCAT(...)` | Réunit les valeurs d'un groupe en une chaîne |
| `SUBSTRING(valeur, 1, 4)` | Extrait une partie d'une chaîne |
| `LENGTH(valeur)` | Donne la longueur d'une chaîne |
| `COUNT(*)` | Compte les lignes, y compris celles avec des `NULL` |
| `SUM()`, `MAX()`, `MIN()` | Calculent sur une colonne, en ignorant les `NULL` |

L'alias `AS` rend le résultat plus lisible, par exemple `SELECT SUBSTRING(date_publication, 1, 4) AS annee FROM livres;`.

## À retenir

- SQL interroge les bases relationnelles, organisées en tables liées par des clés.
- Les contraintes `PRIMARY KEY`, `NOT NULL` et `AUTO_INCREMENT` structurent une table.
- CRUD réunit les quatre opérations de base. La clause `WHERE` évite de toucher toute la table.
- `GROUP BY`, `ORDER BY` et `HAVING` affinent un `SELECT`. `WHERE` filtre avant, `HAVING` après.
- `COUNT(*)` compte les `NULL`, mais `SUM()`, `MAX()` et `MIN()` les ignorent.
