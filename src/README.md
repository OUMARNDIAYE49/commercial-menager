# Projet  ABC Corporation

## Introduction

Ce projet vise à concevoir une base de données relationnelle pour la gestion des clients, des commandes, des produits, des détails des commandes et des paiements. au sein de l'ABC Corporation. La base de données sera développée en SQL et utilisera un Système de Gestion de Base de Données Relationnelle (SGBDR) pour organiser et stocker les informations nécessaires. Concevoir une application Node.js en mode console permettant d'effectuer des opérations CRUD (Create, Read, Update, Delete) sur l'ensemble des tables de la base de données, y compris la gestion des paiements.

## Organisation du Projet

### Étapes pour Prendre en Main le Projet

1. **Analyse Initiale**
   - **Analyse des Données Fournies :**
     - Examinez le fichier Excel fourni par le client pour identifier les entités et leurs relations.
     - Créez un dictionnaire de données basé sur les informations du fichier Excel.

   - **Modélisation Conceptuelle :**
     - Utilisez les données du dictionnaire pour élaborer un Modèle Conceptuel de Données (MCD) illustrant les relations entre les entités.

   - **Modélisation Logique :**
     - Transformez le MCD en Modèle Logique de Données (MLD), en détaillant les attributs et les relations pour chaque table.

2. **Structure de la Base de Données**
   - **Base de Données :**
     - **Nom :** `commercial_manager`
     - **Description :** La base de données principale contenant toutes les tables nécessaires.

   - **Tables :**
    
     **`customers` :** Contient les informations des clients.
     
     **`products` :** Stocke les informations des produits disponibles.
     
     **`purchase_orders` :** Enregistre les détails des commandes passées par les clients.
     
     **`order_details` :** Contient les détails spécifiques de chaque commande.
     
     **`payments` :** Gère les informations relatives aux paiements des commandes.

### Lancer MySQL :**
 - Ouvrez le terminal ou l'invite de commande.
- Connectez-vous à MySQL avec la commande suivante :
         ```mysql -u root -p```
- Saisissez le mot de passe root lorsque cela est 
       demandé.```
### Création de la Base de Données et des Tables

```sql
CREATE DATABASE commercial_manager;

USE commercial_manager;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL
);
ALTER TABLE customers MODIFY name VARCHAR(255) NOT NULL;
ALTER TABLE customers MODIFY email VARCHAR(255) NOT NULL;
ALTER TABLE customers MODIFY phone VARCHAR(20) NOT NULL;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);
ALTER TABLE products MODIFY name VARCHAR(255) NOT NULL;
ALTER TABLE products ADD barcode VARCHAR(50) NOT NULL;
ALTER TABLE products ADD status VARCHAR(50) NOT NULL;
ALTER TABLE products ADD category VARCHAR(100) NOT NULL;

CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    customer_id INT NOT NULL,
    delivery_address VARCHAR(50) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
ALTER TABLE purchase_orders ADD status VARCHAR(50) NOT NULL;
ALTER TABLE purchase_orders ADD track_number VARCHAR(100) NOT NULL;

CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES purchase_orders(id)
);
````
3. **Configurer le projet Node.js et installer les dépendances nécessaires**
  - Initialisation
   
    ```npm init -y```
   
  - les installations dependances
    
    ```npm install mysql2```

     ```npm install readline-sync```
4. **Développement de l'Application Node.js**
   - Concevoir une application en mode console pour effectuer des opérations CRUD.
 
   - Développer les opérations CRUD pour gérer les commandes et les paiements.


## Installation

Suivez ces étapes pour configurer le projet sur votre machine locale :

1. **Clonez le repository :**
   `git clone https://github.com/OUMARNDIAYE49/commercial-menager.git`

2. **Accédez au dossier du projet :**
   `cd commercial-menager`

3. **Installez les dépendances :**

    ```npm install mysql2```

     ```npm install readline-sync```


## Utilisation

Pour démarrer l'application, exécutez la commande suivante :

`node app.js`


## Authors
 

[Oumar Djiby Ndiaye ](https://github.com/OUMARNDIAYE49/commercial-menager.git)
