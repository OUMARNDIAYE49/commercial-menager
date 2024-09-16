const pool = require("./config/db");

// Fonction de validation des données de paiement
function validatePaymentData(order_id, date, amount, payment_method) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const amountRegex = /^[0-9]+(\.[0-9]{1,2})?$/;

  if (!dateRegex.test(date)) {
    throw new Error("La date est invalide. Utilisez le format YYYY-MM-DD.");
  }
  if (!amountRegex.test(amount)) {
    throw new Error("Le montant est invalide. Veuillez saisir un nombre entier .");
  }
  if (typeof payment_method !== "string" || payment_method.trim() === "") {
    throw new Error("La méthode de paiement est invalide. Veuillez saisir format valide.");
  }
}

// Récupérer tous les paiements
async function getPayments() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Payments");
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Récupérer un paiement par ID
async function getPaymentById(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Payments WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new Error("Le paiement n'existe pas.");
    }
    return rows[0];
  } catch (error) {
    console.error("");
    throw error;
  } finally {
    connection.release();
  }
}

// Ajouter un paiement
async function addPayment(order_id, date, amount, payment_method) {
  const connection = await pool.getConnection();
  try {
    validatePaymentData(order_id, date, amount, payment_method);
    const [existingOrder] = await connection.execute("SELECT * FROM purchase_orders WHERE id = ?", [order_id]);

    if (existingOrder.length === 0) {
      throw new Error(`La commande avec l'ID ${order_id} n'existe pas.`);
    }
    const query = "INSERT INTO payments (order_id, date, amount, payment_method) VALUES (?, ?, ?, ?)";
    const [result] = await connection.execute(query, [order_id, date, amount, payment_method]);

    return result;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}
// Fonction pour mettre à jour un paiement dans la base de données
async function updatePayment(id, order_id, date, amount, payment_method) {
  const connection = await pool.getConnection();
  try {
    // Vérification de l'existence du paiement
    const [existingPayment] = await connection.execute("SELECT * FROM payments WHERE id = ?", [id]);
    if (existingPayment.length === 0) {
      throw new Error("Le paiement avec cet ID n'existe pas.");
    }

    // Vérification de l'existence de la commande
    const [existingOrder] = await connection.execute("SELECT * FROM purchase_orders WHERE id = ?", [order_id]);
    if (existingOrder.length === 0) {
      throw new Error(`La commande avec l'ID ${order_id} n'existe pas.`);
    }

    // Valider les données du paiement (utilise la fonction de validation existante)
    validatePaymentData(order_id, date, amount, payment_method);

    // Mise à jour du paiement dans la base de données
    const query = "UPDATE payments SET order_id = ?, date = ?, amount = ?, payment_method = ? WHERE id = ?";
    const [result] = await connection.execute(query, [order_id, date, amount, payment_method, id]);

    // Vérification si la mise à jour a affecté des lignes
    if (result.affectedRows === 0) {
      throw new Error("Aucune mise à jour effectuée. Veuillez vérifier les données saisies.");
    }

    return result;
  } catch (error) {
    // Gestion des erreurs SQL ou des données
    console.error("Erreur lors de la mise à jour du paiement : ", error.message);
    throw error; // Relancer l'erreur pour une gestion ultérieure
  } finally {
    // Libération de la connexion
    connection.release();
  }
}

// Supprimer un paiement
async function deletePayment(id) {
  const connection = await pool.getConnection();
  try {
    const [existingPayment] = await connection.execute("SELECT * FROM Payments WHERE id = ?", [id]);

    if (existingPayment.length === 0) {
      throw new Error("Le paiement n'existe pas.");
    }

    const query = "DELETE FROM Payments WHERE id = ?";
    const [result] = await connection.execute(query, [id]);
    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}
// Vérifier si une commande existe
async function checkOrderExists(order_id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM purchase_orders WHERE id = ?", [order_id]); 
    return rows.length > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'existence de la commande :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Autres fonctions du module (par exemple, getPayments, addPayment, etc.)

module.exports = {
  getPayments,
  getPaymentById,
  addPayment,
  updatePayment,
  deletePayment,
  checkOrderExists, // Assurez-vous d'exporter la nouvelle fonction
};
