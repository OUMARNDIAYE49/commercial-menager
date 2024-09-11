const pool = require("./db");

// Fonction pour valider les entrées
function validateCustomerData(name, email, phone) {
  const nameRegex = /^[A-Za-z\s]+$/; // Regex pour valider que le nom contient uniquement des lettres et des espaces
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Regex pour valider le format de l'email
  const phoneRegex = /^[0-9]{1,8}$/; // Regex pour valider que le téléphone contient uniquement des chiffres et ne dépasse pas 8 caractères

  if (!nameRegex.test(name)) {
    throw new Error("Le nom invalide.");
  }
  if (!emailRegex.test(email)) {
    throw new Error("L'email est invalide.");
  }
  if (!phoneRegex.test(phone)) {
    throw new Error("Format de téléphone est invalide.");
  }
}

// Fonctions pour la gestion des clients
async function getCustomers() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Customers");
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function getCustomerById(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Customers WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new Error("Le client n'existe pas.");
    }
    return rows[0];
  } catch (error) {
    console.error("Erreur lors de la récupération du client :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function addCustomer(name, email, phone, address) {
  const connection = await pool.getConnection();
  try {
    // Valider les données avant d'ajouter le client
    validateCustomerData(name, email, phone);

    const query = "INSERT INTO Customers (name, email, phone, address) VALUES (?, ?, ?, ?)";
    const [result] = await connection.execute(query, [name, email, phone, address]);
    return result;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un client :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function updateCustomer(id, name, email, phone, address) {
  const connection = await pool.getConnection();
  try {
    // Vérifier si le client existe
    const [existingCustomer] = await connection.execute("SELECT * FROM Customers WHERE id = ?", [id]);

    if (existingCustomer.length === 0) {
      throw new Error("Le client n'existe pas.");
    }

    // Valider les données avant de mettre à jour le client
    validateCustomerData(name, email, phone);

    const query = "UPDATE Customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?";
    const [result] = await connection.execute(query, [name, email, phone, address, id]);
    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteCustomer(id) {
  const connection = await pool.getConnection();
  try {
    // Vérifier si le client existe
    const [existingCustomer] = await connection.execute("SELECT * FROM Customers WHERE id = ?", [id]);

    if (existingCustomer.length === 0) {
      throw new Error("Le client n'existe pas.");
    }

    // Supprimer le client
    const query = "DELETE FROM Customers WHERE id = ?";
    const [result] = await connection.execute(query, [id]);
    return result;
  } catch (error) {
    console.error("");
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer
};
