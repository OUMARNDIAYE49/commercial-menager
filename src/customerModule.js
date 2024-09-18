const pool = require("./config/db");

async function doesEmailExist(email) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    throw new Error("Erreur lors de la vérification de l'email : " + error.message);
  } finally {
    connection.release();
  }
}

function validateCustomerData(email, phone) {
  const emailRegex = /^.+@.+\..+$/
  // Expression régulière mise à jour pour autoriser tout type de format
  const phoneRegex = /^.{1,20}$/;

  let errors = [];

  if (!email || !emailRegex.test(email)) {
    errors.push("L'email est invalide.");
  }
  if (!phone || !phoneRegex.test(phone)) {
    errors.push("Le numéro de téléphone doit contenir entre 8 et 20 caractères.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }
}

async function doesPhoneExist(phone) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM customers WHERE phone = ?",
      [phone]
    );
    return rows.length > 0;
  } catch (error) {
    throw new Error("Erreur lors de la vérification du numéro de téléphone : " + error.message);
  } finally {
    connection.release();
  }
}

async function getCustomers() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM customers");
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
    const [rows] = await connection.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );
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
    if (!name || !email || !phone || !address) {
      throw new Error("Tous les champs doivent être remplis.");
    }
    validateCustomerData(email, phone);
    const emailExists = await doesEmailExist(email);
    if (emailExists) {
      throw new Error("Cet email existe déjà.");
    }
    const phoneExists = await doesPhoneExist(phone);
    if (phoneExists) {
      throw new Error("Ce numéro de téléphone existe déjà.");
    }
    const query =
      "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)";
    const [result] = await connection.execute(query, [
      name,
      email,
      phone,
      address,
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}

async function updateCustomer(id, name, email, phone, address) {
  const connection = await pool.getConnection();
  try {
    if (!name || !email || !phone || !address) {
      throw new Error("Tous les champs doivent être remplis.");
    }
    const [existingCustomer] = await connection.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );
    if (existingCustomer.length === 0) {
      throw new Error("Le client avec ce ID n'existe pas.");
    }
    validateCustomerData(email, phone);
    const emailExists = await doesEmailExist(email);
    if (emailExists && email !== existingCustomer[0].email) {
      throw new Error("Cet email existe déjà.");
    }
    const phoneExists = await doesPhoneExist(phone);
    if (phoneExists && phone !== existingCustomer[0].phone) {
      throw new Error("Ce numéro de téléphone existe déjà.");
    }
    const query =
      "UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?";
    const [result] = await connection.execute(query, [
      name,
      email,
      phone,
      address,
      id,
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}

async function deleteCustomer(id) {
  const connection = await pool.getConnection();
  try {
    const [existingCustomer] = await connection.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );
    if (existingCustomer.length === 0) {
      throw new Error("Le client avec l'ID spécifié n'existe pas.");
    }
    const [referencedCustomer] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE customer_id = ?",
      [id]
    );
    if (referencedCustomer.length > 0) {
      throw new Error("Impossible de supprimer le client car il est référencé dans des commandes existantes.");
    }

    const query = "DELETE FROM customers WHERE id = ?";
    const [result] = await connection.execute(query, [id]);
    return { message: "Le client a été supprimé avec succès.", result };
  } catch (error) {
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  doesEmailExist,
  doesPhoneExist,
};
