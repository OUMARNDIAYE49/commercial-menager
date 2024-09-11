const pool = require("./db");

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
    console.error("Erreur lors de la récupération des commandes :", error.message);
    throw new Error(`Erreur lors de la récupération des commandes : ${error.message}`);
  } finally {
    connection.release();
  }
}


async function addPurchaseOrder(order) {
  const { date, delivery_address, track_number, status, customer_id, details } = order;
  
  if (!date || !delivery_address || !track_number || !status || !customer_id) {
    throw new Error("Tous les champs de la commande sont requis.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "INSERT INTO purchase_Orders (date, delivery_address, track_number, status, customer_id) VALUES (?, ?, ?, ?, ?)",
      [date, delivery_address, track_number, status, customer_id]
    );
    const orderId = result.insertId;

    if (details && details.length > 0) {
      for (const detail of details) {
        const { product_id, quantity, price } = detail;
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
    console.error("Erreur lors de l'ajout de la commande :", error.message);
    throw new Error(`Erreur lors de l'ajout de la commande : ${error.message}`);
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

  
    const query = "UPDATE purchase_Orders SET date = ?, delivery_address = ?, track_number = ?, status = ?, customer_id = ? WHERE id = ?";
    const [result] = await connection.execute(query, [
      updates.date,
      updates.delivery_address,
      updates.track_number,
      updates.status,
      updates.customer_id,
      id
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Commande non trouvée.");
    }

  
    if (updates.details && updates.details.length > 0) {
      await connection.execute("DELETE FROM order_details WHERE order_id = ?", [id]);

      for (const detail of updates.details) {
        const { product_id, quantity, price } = detail;
        await connection.execute(
          "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [id, product_id, quantity, price]
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error.message);
    throw new Error(`Erreur lors de la mise à jour de la commande : ${error.message}`);
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

    const [result] = await connection.execute("DELETE FROM purchase_Orders WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      throw new Error("Commande non trouvée.");
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande :", error.message);
    throw new Error(`Erreur lors de la suppression de la commande : ${error.message}`);
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
    console.error("Erreur lors de la récupération de la commande :", error.message);
    throw new Error(`Erreur lors de la récupération de la commande : ${error.message}`);
  } finally {
    connection.release();
  }
}

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById, 
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
};

