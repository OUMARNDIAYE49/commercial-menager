const pool = require("./config/db");

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

async function getPurchaseOrders() {
  const connection = await pool.getConnection();
  try {
    const [orders] = await connection.execute("SELECT * FROM purchase_Orders");

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
    console.error(
      "Erreur lors de la récupération des commandes :",
      error.message
    );
    throw new Error(
      `Erreur lors de la récupération des commandes : ${error.message}`
    );
  } finally {
    connection.release();
  }
}

async function addPurchaseOrder(order) {
  const { date, delivery_address, track_number, status, customer_id, details } = order;

  if (!date) {
    throw new Error("Le champ date est obligatoire.");
  }
  if (!isValidDate(date)) {
    throw new Error("Format de date invalide. Veuillez saisir une date valide.");
  }
  if (!delivery_address || typeof delivery_address !== "string") {
    throw new Error("L'adresse de livraison doit contenir uniquement du texte.");
  }
  if (!track_number || !Number.isInteger(track_number) || track_number <= 0) {
    throw new Error("Le numéro de suivi doit être un nombre entier positif.");
  }
  if (!status || typeof status !== "string") {
    throw new Error("Le statut doit contenir uniquement du texte.");
  }
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

        const [existingProduct] = await connection.execute(
          "SELECT * FROM Products WHERE id = ?",
          [product_id]
        );
        if (existingProduct.length === 0) {
          throw new Error("Le produit avec cet ID n'existe pas.");
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("La quantité doit être un nombre entier positif.");
        }

        if (!/^\d+(\.\d{1,2})?$/.test(price) || price <= 0) {
          throw new Error("Le prix doit être un nombre décimal positif avec deux chiffres après la virgule.");
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
      throw new Error(`Erreur lors de l'ajout de la commande : ${error.message}`);
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

    if (date && !isValidDate(date)) {
      throw new Error("Format de date invalide.");
    }

    if (typeof delivery_address !== 'string') {
      throw new Error("L'adresse de livraison doit contenir uniquement du texte.");
    }

   
    if (typeof status !== 'string') {
      throw new Error("Le statut doit contenir uniquement du texte.");
    }

    if (!customer_id) {
      throw new Error("L'ID du client est obligatoire et ne peut pas être null.");
    }

    const query =
      "UPDATE purchase_Orders SET date = ?, delivery_address = ?, track_number = ?, status = ?, customer_id = ? WHERE id = ?";

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

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("La quantité doit être un nombre entier positif.");
        }

        if (!/^\d+(\.\d{1,2})?$/.test(price) || price <= 0) {
          throw new Error("Le prix doit être un nombre décimal positif avec deux chiffres après la virgule.");
        }

        await connection.execute(
          "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [id, product_id, quantity, price]
        );
      }
    }

    return result;
  } catch (error) {
    throw new Error(
      `Erreur lors de la mise à jour de la commande : ${error.message}`
    );
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

    await connection.execute("DELETE FROM order_details WHERE order_id = ?", [
      id,
    ]);

    const [result] = await connection.execute(
      "DELETE FROM purchase_Orders WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Commande non trouvée.");
    }

    return result;
  } catch (error) {
    throw new Error("Commande non trouvée");
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
      "SELECT * FROM purchase_Orders WHERE id = ?",
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
    throw new Error("Commande non trouvée.");
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
