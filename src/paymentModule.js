const pool = require("./db");


function validatePaymentData(order_id, date, amount, payment_method) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; 
  const amountRegex = /^[0-9]+(\.[0-9]{1,2})?$/; 

  if (!dateRegex.test(date)) {
    throw new Error("La date est invalide. Utilisez le format YYYY-MM-DD.");
  }
  if (!amountRegex.test(amount)) {
    throw new Error("Le montant est invalide.");
  }
  if (typeof payment_method !== 'string' || payment_method.trim() === '') {
    throw new Error("La méthode de paiement est invalide.");
  }
}

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

async function getPaymentById(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Payments WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new Error("Le paiement n'existe pas.");
    }
    return rows[0];
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function addPayment(order_id, date, amount, payment_method) {
  const connection = await pool.getConnection();
  try {
    validatePaymentData(order_id, date, amount, payment_method);

    const query = "INSERT INTO Payments (order_id, date, amount, payment_method) VALUES (?, ?, ?, ?)";
    const [result] = await connection.execute(query, [order_id, date, amount, payment_method]);
    return result;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un paiement :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function updatePayment(id, order_id, date, amount, payment_method) {
  const connection = await pool.getConnection();
  try {
  
    const [existingPayment] = await connection.execute("SELECT * FROM Payments WHERE id = ?", [id]);

    if (existingPayment.length === 0) {
      throw new Error("Le paiement n'existe pas.");
    }

  
    validatePaymentData(order_id, date, amount, payment_method);

    const query = "UPDATE Payments SET order_id = ?, date = ?, amount = ?, payment_method = ? WHERE id = ?";
    const [result] = await connection.execute(query, [order_id, date, amount, payment_method, id]);
    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

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

module.exports = {
  getPayments,
  getPaymentById,
  addPayment,
  updatePayment,
  deletePayment,
};
