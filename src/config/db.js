
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'Nd49523097', 
  database: 'commercial_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connexion à la base de données réussie.");
    connection.release(); 
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error.message);
  }
}

testConnection();

module.exports = pool;
