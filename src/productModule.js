const pool = require("./config/db");

// Fonction pour valider les données du produit
function validateProductData(
  name,
  description,
  price,
  stock,
  category,
  barcode,
  status
) {
  // Expressions régulières pour les validations
  const nameRegex = /^.{1,255}$/; // VARCHAR(255)
  const descriptionRegex = /^.{1,}$/; // TEXT (pas de limite spécifique, mais doit être non vide)
  const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/; // DECIMAL(10,2)
  const stockRegex = /^[0-9]+$/; // INT (valeurs numériques entières)
  const categoryRegex = /^.{1,100}$/; // VARCHAR(100)
  const statusRegex = /^.{1,50}$/; // VARCHAR(50)
  const barcodeRegex = /^.{1,50}$/; // VARCHAR(50)

  // Validation des champs
  if (!nameRegex.test(name)) {
    throw new Error("Le nom du produit est invalide.");
  }
  if (!descriptionRegex.test(description)) {
    throw new Error("La description du produit est invalide.");
  }
  if (!priceRegex.test(price) || parseFloat(price) < 0 || parseFloat(price) > 99999999.99) {
    throw new Error("Le prix du produit est invalide. Il doit être un nombre décimal valide avec jusqu'à 2 décimales.");
  }
  if (!stockRegex.test(stock)) {
    throw new Error("Le stock du produit est invalide. Il doit être un nombre entier.");
  }
  if (!categoryRegex.test(category)) {
    throw new Error("La catégorie du produit est invalide.");
  }
  if (!statusRegex.test(status)) {
    throw new Error("Le statut du produit est invalide.");
  }
  if (!barcodeRegex.test(barcode)) {
    throw new Error("Le code-barres du produit est invalide.");
  }
}

// Fonction pour obtenir tous les produits
async function getProducts() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM products");
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour ajouter un produit
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
      "SELECT * FROM products WHERE barcode = ?",
      [barcode]
    );

    if (existingProduct.length > 0) {
      throw new Error(`Un produit avec le code-barres ${barcode} existe déjà.`);
    }

    const query =
      "INSERT INTO products (name, description, price, stock, category, barcode, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
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
    console.error("");
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour mettre à jour un produit
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
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      throw new Error("Le produit avec ce ID n'existe pas.");
    }

    const query =
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, barcode = ?, status = ? WHERE id = ?";
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
    console.error("");
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
    const [existingProduct] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      throw new Error("Le produit avec ce ID n'existe pas.");
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

    const query = "DELETE FROM products WHERE id = ?";
    const [result] = await connection.execute(query, [id]);

    return { message: "Produit supprimé avec succès.", result };
  } catch (error) {
    console.error("");
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction pour obtenir un produit par ID
async function getProductById(id) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("L'ID du produit doit être un chiffre.");
  }

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Le produit avec ce ID n'existe pas.");
    }

    return rows[0];
  } catch (error) {
    console.error("");
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
