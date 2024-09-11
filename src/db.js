// db.js

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Remplacez par votre nom d'utilisateur
  password: 'Nd49523097', // Remplacez par votre mot de passe
  database: 'commercial_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3308
});

// Test de la connexion à la base de données
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connexion à la base de données réussie.");
    connection.release(); // Libérer la connexion après le test
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error.message);
  }
}

// Exécuter le test de connexion immédiatement
testConnection();

module.exports = pool;
