const pool = require("./config/db");

function validateProductData(
  name,
  description,
  price,
  stock,
  category,
  barcode,
  status
) {
  const alphaRegex = /^[A-Za-z\s]+$/;
  const numericRegex = /^[0-9]+$/;

  if (!alphaRegex.test(description)) {
    throw new Error("La description du produit est invalide.");
  }
  if (!alphaRegex.test(category)) {
    throw new Error("La catégorie du produit est invalide.");
  }
  if (!alphaRegex.test(status)) {
    throw new Error("Le statut du produit est invalide.");
  }

  if (!numericRegex.test(price)) {
    throw new Error("Le prix du produit est invalide.");
  }
  if (!numericRegex.test(stock)) {
    throw new Error("Le stock du produit est invalide.");
  }
  if (!numericRegex.test(barcode)) {
    throw new Error("Le code-barres du produit est invalide.");
  }
}

async function getProducts() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Products");
    return rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits :",
      error.message
    );
    throw error;
  } finally {
    connection.release();
  }
}

async function addProduct(
  name,
  description,
  price,
  stock,
  category,
  barcode,
  status
) {
  validateProductData(
    name,
    description,
    price,
    stock,
    category,
    barcode,
    status
  );

  const connection = await pool.getConnection();
  try {
    const [existingProduct] = await connection.execute(
      "SELECT * FROM Products WHERE barcode = ?",
      [barcode]
    );

    if (existingProduct.length > 0) {
      throw new Error(`Un produit avec le code-barres ${barcode} existe déjà.`);
    }

    const query =
      "INSERT INTO Products (name, description, price, stock, category, barcode, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await connection.execute(query, [
      name,
      description,
      price,
      stock,
      category,
      barcode,
      status,
    ]);

    return result;
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(
  id,
  name,
  description,
  price,
  stock,
  category,
  barcode,
  status
) {
  validateProductData(
    name,
    description,
    price,
    stock,
    category,
    barcode,
    status
  );

  const connection = await pool.getConnection();
  try {
    const [existingProduct] = await connection.execute(
      "SELECT * FROM Products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      throw new Error("Le produit n'existe pas.");
    }

    const query =
      "UPDATE Products SET name = ?, description = ?, price = ?, stock = ?, category = ?, barcode = ?, status = ? WHERE id = ?";
    const [result] = await connection.execute(query, [
      name,
      description,
      price,
      stock,
      category,
      barcode,
      status,
      id,
    ]);

    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProduct(id) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("L'ID du produit doit être un chiffre.");
  }

  const connection = await pool.getConnection();
  try {
    const [existingProduct] = await connection.execute(
      "SELECT * FROM Products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      throw new Error("Le produit n'existe pas.");
    }

    const [referencedProduct] = await connection.execute(
      "SELECT * FROM order_details WHERE product_id = ?",
      [id]
    );
    if (referencedProduct.length > 0) {
      throw new Error(
        "Impossible de supprimer le produit car il est référencé dans des détails de commande existants."
      );
    }

    const query = "DELETE FROM Products WHERE id = ?";
    const [result] = await connection.execute(query, [id]);

    return { message: "Produit supprimé avec succès.", result };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function getProductById(id) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("L'ID du produit doit être un chiffre.");
  }

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM Products WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Le produit n'existe pas.");
    }

    return rows[0];
  } catch (error) {
    console.error("Erreur lors de la récupération du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};
