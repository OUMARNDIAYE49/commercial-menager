const pool = require("./db");


function validateCustomerData(name, email, phone) {
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const phoneRegex = /^[0-9]{1,8}$/; 

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

async function getCustomers() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Customers");
    return rows;
  } catch (error) {
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
    throw error;
  } finally {
    connection.release();
  }
}

async function addCustomer(name, email, phone, address) {
  const connection = await pool.getConnection();
  try {
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
    const [existingCustomer] = await connection.execute("SELECT * FROM Customers WHERE id = ?", [id]);
    if (existingCustomer.length === 0) {
      throw new Error("Le client n'existe pas.");
    }
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
    const [existingCustomer] = await connection.execute("SELECT * FROM Customers WHERE id = ?", [id]);

    if (existingCustomer.length === 0) {
      throw new Error("Le client n'existe pas.");
    }
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
