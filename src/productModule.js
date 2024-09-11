const pool = require("./db");

// Fonction de validation des données du produit
function validateProductData(name, description, price, stock, category, barcode, status) {
  const alphaRegex = /^[A-Za-z\s]+$/; // Regex pour valider que le champ contient uniquement des lettres et des espaces
  const numericRegex = /^[0-9]+$/; // Regex pour valider que le champ contient uniquement des chiffres

  // Validation des champs alphabétiques
  if (!alphaRegex.test(description)) {
    throw new Error("La description du produit est invalide.");
  }
  if (!alphaRegex.test(category)) {
    throw new Error("La catégorie du produit est invalide.");
  }
  if (!alphaRegex.test(status)) {
    throw new Error("Le statut du produit est invalide.");
  }

  // Validation des champs numériques
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

// Fonction pour récupérer tous les produits
async function getProducts() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Products");
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour ajouter un produit
async function addProduct(name, description, price, stock, category, barcode, status) {
  validateProductData(name, description, price, stock, category, barcode, status); // Appel à la fonction de validation

  const connection = await pool.getConnection();
  try {
    const query = "INSERT INTO Products (name, description, price, stock, category, barcode, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await connection.execute(query, [name, description, price, stock, category, barcode, status]);
    return result;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour mettre à jour un produit
async function updateProduct(id, name, description, price, stock, category, barcode, status) {
  validateProductData(name, description, price, stock, category, barcode, status); // Appel à la fonction de validation

  const connection = await pool.getConnection();
  try {
    // Vérifier si le produit existe
    const [existingProduct] = await connection.execute("SELECT * FROM Products WHERE id = ?", [id]);

    if (existingProduct.length === 0) {
      throw new Error("Le produit n'existe pas.");
    }

    const query = "UPDATE Products SET name = ?, description = ?, price = ?, stock = ?, category = ?, barcode = ?, status = ? WHERE id = ?";
    const [result] = await connection.execute(query, [name, description, price, stock, category, barcode, status, id]);
    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour supprimer un produit
async function deleteProduct(id) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("L'ID du produit doit être un chiffre.");
  }

  const connection = await pool.getConnection();
  try {
    // Vérifier si le produit existe
    const [existingProduct] = await connection.execute("SELECT * FROM Products WHERE id = ?", [id]);

    if (existingProduct.length === 0) {
      throw new Error("Le produit n'existe pas.");
    }

    const query = "DELETE FROM Products WHERE id = ?";
    const [result] = await connection.execute(query, [id]);
    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour récupérer un produit par ID
async function getProductById(id) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("L'ID du produit doit être un chiffre.");
  }

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Products WHERE id = ?", [id]);
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

// Exportation des fonctions pour être utilisées dans d'autres fichiers
module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById
};
