const pool = require("./config/db");

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function validateDate(date) {
  if (!date || !isValidDate(date)) {
    throw new Error("Format de date invalide. Veuillez saisir une date valide.");
  }
}
function validateDeliveryAddress(address) {
  if (!address || typeof address !== "string") {
    throw new Error("L'adresse de livraison doit contenir uniquement du texte.");
  }
}
function validateTrackNumber(trackNumber) {
  if (!trackNumber || typeof trackNumber !== "string" || trackNumber.length > 100) {
    throw new Error("Le numéro de suivi doit être une chaîne de caractères de 100 caractères maximum.");
  }
}
function validateStatus(status) {
  if (!status || typeof status !== "string" || status.length > 50) {
    throw new Error("Le statut doit être une chaîne de caractères de 50 caractères maximum.");
  }
}
function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("La quantité doit être un nombre entier positif.");
  }
}
function validatePrice(price) {
  if (!/^\d+(\.\d{1,2})?$/.test(price) || price <= 0) {
    throw new Error("Le prix doit être un nombre décimal positif avec deux chiffres après la virgule.");
  }
}
async function getPurchaseOrders() {
  const connection = await pool.getConnection();
  try {
    const [orders] = await connection.execute("SELECT * FROM purchase_orders");

    if (!orders || orders.length === 0) {
      console.error("Aucune commande trouvée.");
      return [];
    }

    for (const order of orders) {
      const orderId = order.id;

      if (!orderId) {
        console.warn(`Commande sans ID trouvée, elle sera ignorée.`);
        continue;
      }

      const [details] = await connection.execute(
        "SELECT * FROM order_details WHERE order_id = ?",
        [orderId]
      );

      order.details = details || [];
    }

    return orders;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error.message);
    throw new Error(`Erreur lors de la récupération des commandes : ${error.message}`);
  } finally {
    connection.release();
  }
}
async function addPurchaseOrder(order) {
  const { date, delivery_address, track_number, status, customer_id, details } = order;

  validateDate(date);
  validateDeliveryAddress(delivery_address);
  validateTrackNumber(track_number);
  validateStatus(status);

  if (!customer_id) {
    throw new Error("L'ID du client est obligatoire.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCustomer] = await connection.execute(
      "SELECT * FROM Customers WHERE id = ?",
      [customer_id]
    );
    if (existingCustomer.length === 0) {
      throw new Error("Le client avec cet ID n'existe pas.");
    }

    const [result] = await connection.execute(
      "INSERT INTO purchase_orders (date, delivery_address, track_number, status, customer_id) VALUES (?, ?, ?, ?, ?)",
      [date, delivery_address, track_number, status, customer_id]
    );
    const orderId = result.insertId;

    if (details && details.length > 0) {
      for (const detail of details) {
        const { product_id, quantity, price } = detail;

        validateQuantity(quantity);
        validatePrice(price);

        const [existingProduct] = await connection.execute(
          "SELECT * FROM Products WHERE id = ?",
          [product_id]
        );
        if (existingProduct.length === 0) {
          throw new Error("Le produit avec cet ID n'existe pas.");
        }

        await connection.execute(
          "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, product_id, quantity, price]
        );
      }
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    if (error.message.includes("foreign key constraint fails")) {
      throw new Error("Erreur lors de l'enregistrement de la commande : Le produit ou le client référencé n'existe pas.");
    } else {
      throw new Error(`: ${error.message}`);
    }
  } finally {
    connection.release();
  }
}

async function updatePurchaseOrder(id, updates) {
  const connection = await pool.getConnection();
  try {
    if (!/^[0-9]+$/.test(id)) {
      throw new Error("L'ID de la commande doit être un chiffre.");
    }

    const { date, delivery_address, track_number, status, customer_id, details } = updates;

    if (date) validateDate(date);
    if (delivery_address) validateDeliveryAddress(delivery_address);
    if (track_number) validateTrackNumber(track_number);
    if (status) validateStatus(status);
    if (customer_id === undefined) {
      throw new Error("L'ID du client est obligatoire et ne peut pas être null.");
    }
    const [customerResult] = await connection.execute("SELECT id FROM customers WHERE id = ?", [customer_id]);
    if (customerResult.length === 0) {
      throw new Error(`Le client avec l'ID ${customer_id} n'existe pas.`);
    }

    const query =
      "UPDATE purchase_orders SET date = ?, delivery_address = ?, track_number = ?, status = ?, customer_id = ? WHERE id = ?";

    const [result] = await connection.execute(query, [
      date || null,
      delivery_address || null,
      track_number || null,
      status || null,
      customer_id,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Commande non trouvée.");
    }

    if (details && details.length > 0) {
      await connection.execute("DELETE FROM order_details WHERE order_id = ?", [id]);

      for (const detail of details) {
        const { product_id, quantity, price } = detail;

        validateQuantity(quantity);
        validatePrice(price);

        await connection.execute(
          "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [id, product_id, quantity, price]
        );
      }
    }

    return result;
  } catch (error) {
    throw new Error(`: ${error.message}`);
  } finally {
    connection.release();
  }
}
async function deletePurchaseOrder(id) {
  const connection = await pool.getConnection();
  try {
    if (!/^[0-9]+$/.test(id)) {
      throw new Error("L'ID de la commande doit être un chiffre.");
    }
    await connection.execute("DELETE FROM order_details WHERE order_id = ?", [id]);
    await connection.execute("DELETE FROM purchase_orders WHERE id = ?", [id]);

  } catch (error) {
    throw new Error("Impossible de supprimer la commande. Une erreur est survenue.");
  } finally {
    connection.release();
  }
}

async function getPurchaseOrderById(id) {
  const connection = await pool.getConnection();
  try {
    if (!/^[0-9]+$/.test(id)) {
      throw new Error("L'ID de la commande doit être un chiffre.");
    }
    const [orderRows] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id]
    );

    if (orderRows.length === 0) {
      throw new Error("Commande non trouvée.");
    }

    const order = orderRows[0];

    const [details] = await connection.execute(
      "SELECT * FROM order_details WHERE order_id = ?",
      [id]
    );

    order.details = details || [];

    return order;
  } catch (error) {
    throw new Error("Erreur lors de la récupération de la commande : " + error.message);
  } finally {
    connection.release();
  }
}

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
