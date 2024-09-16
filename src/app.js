const readline = require("readline");
const customerModule = require("./customerModule");
const paymentModule = require("./paymentModule");
const productModule = require("./productModule");
const orderModule = require("./purchaseOrderModule");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Connexion à la base de données réussie.");

const mainMenu = () => {
  console.log("\n=== Menu Principal ===");
  console.log("1. Gérer les clients");
  console.log("2. Gérer les paiements");
  console.log("3. Gérer les produits");
  console.log("4. Gérer les commandes");
  console.log("5. Quitter");

  rl.question("Choisissez une option : ", (option) => {
    switch (option) {
      case "1":
        customerMenu();
        break;
      case "2":
        paymentMenu();
        break;
      case "3":
        productMenu();
        break;
      case "4":
        orderMenu(); 
        break;
      case "5":
        console.log("Au revoir !");
        rl.close();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        mainMenu();
        break;
    }
  });
};

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function customerMenu() {
  console.log("\n====  Menu Client  ===");
  console.log("1. Voir tous les clients");
  console.log("2. Ajouter un client");
  console.log("3. Mettre à jour un client");
  console.log("4. Supprimer un client");
  console.log("5. Voir un client par ID");
  console.log("6. Retour au menu principal");

  const option = await askQuestion("\nChoisissez une option : ");

  try {
    switch (option) {
      case "1":
        const customers = await customerModule.getCustomers();
        console.table(customers);
        console.log(""); 
        customerMenu();
        break;
      case "2":
        await addCustomerFlow();
        break;
      case "3":
        await updateCustomerFlow();
        break;
      case "4":
        await deleteCustomerFlow();
        break;
      case "5":
        await viewCustomerFlow();
        break;
      case "6":
        console.log(""); 
        mainMenu();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        console.log(""); 
        customerMenu();
        break;
    }
  } catch (error) {
    console.error("Erreur:", error.message);
    console.log(""); 
    customerMenu();
  }
}

async function addCustomerFlow() {
  let name = await promptValidInput("Nom : ", validateName);
  let email = await promptValidInput("Email : ", validateEmail);
  let phone = await promptValidInput("Téléphone : ", validatePhone);
  let address = await promptValidInput("Adresse : ", validateAddress);

  try {
    await customerModule.addCustomer(name, email, phone, address);
    console.log("Client ajouté avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout du client :", error.message);
  }

  console.log(""); 
  customerMenu();
}

async function updateCustomerFlow() {
  const id = await askQuestion("ID du client à mettre à jour : ");
  let name = await promptValidInput("Nom : ", validateName);
  let email = await promptValidInput("Email : ", validateEmail);
  let phone = await promptValidInput("Téléphone : ", validatePhone);
  let address = await promptValidInput("Adresse : ", validateAddress);

  try {
    await customerModule.updateCustomer(id, name, email, phone, address);
    console.log("Client mis à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client :", error.message);
  }

  console.log("");
  customerMenu();
}

async function deleteCustomerFlow() {
  const id = await askQuestion("ID du client à supprimer : ");

  try {
    const { message } = await customerModule.deleteCustomer(id);
    console.log(message);
  } catch (error) {
    console.error("Erreur lors de la suppression du client :", error.message);
  }
  
  console.log("");
  customerMenu();
}

async function viewCustomerFlow() {
  const id = await askQuestion("ID du client à voir : ");

  try {
    const customer = await customerModule.getCustomerById(id);
    console.table([customer]);
  } catch (error) {
    console.error("Erreur lors de la récupération du client :", error.message);
  }

  console.log("");
  customerMenu();
}
async function promptValidInput(promptText, validateFunc) {
  let input;
  while (true) {
    input = await askQuestion(promptText);
    try {
      validateFunc(input);
      return input;
    } catch (error) {
      console.log(error.message);
    }
  }
}
function validateName(name) {
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    throw new Error("Le nom est invalide.");
  }
}
function validateEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    throw new Error("L'email est invalide.");
  }
}
function validatePhone(phone) {
  const phoneRegex = /^[0-9]{1,20}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Le format du téléphone est invalide.");
  }
}
function validateAddress(address) {
  if (!address) {
    throw new Error("L'adresse ne peut pas être vide.");
  }
}

const paymentMenu = () => {
  console.log("\n=== Menu Paiements ===");
  console.log("1. Voir tous les paiements");
  console.log("2. Ajouter un paiement");
  console.log("3. Mettre à jour un paiement");
  console.log("4. Supprimer un paiement");
  console.log("5. Voir un paiement par ID");
  console.log("6. Retour au menu principal");

  rl.question("Choisissez une option : ", async (option) => {
    try {
      switch (option) {
        case "1":
          const payments = await paymentModule.getPayments();
          console.table(payments);
          paymentMenu();
          break;

        case "2":
          await handleAddPayment();
          break;

        case "3":
          await handleUpdatePayment();
          break;

        case "4":
          await handleDeletePayment();
          break;

        case "5":
          await handleViewPaymentById();
          break;

        case "6":
          mainMenu();
          break;

        default:
          console.log("Option invalide, veuillez réessayer.");
          paymentMenu();
          break;
      }
    } catch (error) {
      console.error("Erreur:", error.message);
      paymentMenu();
    }
  });
};

// Fonction pour gérer l'ajout d'un paiement
const handleAddPayment = async () => {
  const order_id = await promptForValidInput("ID de la commande : ", /^[0-9]+$/, "L'ID de commande n'existe pas");
  const date = await promptForValidInput("Date (YYYY-MM-DD) : ", /^\d{4}-\d{2}-\d{2}$/, "Format de date invalide. Veuillez utiliser le format YYYY-MM-DD.");
  const amount = await promptForValidInput("Montant : ", /^[0-9]+(\.[0-9]{1,2})?$/, "Veuillez saisir un nombre entier ou un décimal avec jusqu'à deux chiffres après la virgule.");
  const payment_method = await promptForValidInput
  ("Méthode de paiement : ", /^.+$/, "La méthode de paiement est invalide.");
  try {
    const existingOrder = await paymentModule.checkOrderExists(order_id); 
    if (!existingOrder) {
      console.error("La commande avec l'ID spécifié n'existe pas.");
      return handleAddPayment(); 
    }
    await paymentModule.addPayment(order_id, date, amount, payment_method);
    console.log("Paiement ajouté avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout du paiement : " + error.message);
  }
  paymentMenu();
};

// Fonction pour demander des entrées utilisateur avec validation
// const promptForValidInput = async (message, validationRegex, errorMessage) => {
//   let input;
//   do {
//     input = await promptUser(message);
//     if (!validationRegex.test(input)) {
//       console.error(errorMessage);
//     }
//   } while (!validationRegex.test(input));
//   return input;
// };

// Fonction pour gérer la mise à jour d'un paiement
const handleUpdatePayment = async () => {
  // Récupérer les informations avec validation des entrées utilisateur
  const id = await promptForValidInput("ID du paiement à mettre à jour : ", /^[0-9]+$/, "L'ID du paiement est obligatoire et doit être un nombre entier.");
  const order_id = await promptForValidInput("ID de la commande : ", /^[0-9]+$/, "L'ID de commande est obligatoire et doit être un nombre entier.");
  const date = await promptForValidInput("Date (YYYY-MM-DD) : ", /^\d{4}-\d{2}-\d{2}$/, "Format de date invalide. Veuillez utiliser le format YYYY-MM-DD.");
  const amount = await promptForValidInput("Montant : ", /^[0-9]+(\.[0-9]{1,2})?$/, "Veuillez saisir un nombre entier ou un décimal valide.");
  const payment_method = await promptForValidInput("Méthode de paiement : ", /^.+$/, "La méthode de paiement est obligatoire et doit être un texte valide.");

  try {
    // Vérifier si le paiement existe
    const existingPayment = await paymentModule.getPaymentById(id);
    if (!existingPayment) {
      console.error("Le paiement avec cet ID n'existe pas.");
      return handleUpdatePayment(); // Redemander les informations
    }

    // Vérifier si la commande existe
    const existingOrder = await paymentModule.checkOrderExists(order_id); 
    if (!existingOrder) {
      console.error("La commande avec l'ID spécifié n'existe pas.");
      return handleUpdatePayment(); // Redemander les informations
    }

    // Mise à jour du paiement
    await paymentModule.updatePayment(id, order_id, date, amount, payment_method);
    console.log("Paiement mis à jour avec succès.");
  } catch (error) {
    // Gestion des erreurs possibles pendant l'exécution
    console.error("Erreur lors de la mise à jour du paiement : ", error.message);
  }

  // Retour au menu de paiement
  paymentMenu();
};

const handleDeletePayment = async () => {
  const id = await promptForValidInput("ID du paiement à supprimer : ", /^[0-9]+$/, "L'ID du paiement est obligatoire.");
  try {
    const existingPayment = await paymentModule.getPaymentById(id);
    if (!existingPayment) {
      console.error("Le paiement avec cet ID n'existe pas.");
      return handleDeletePayment(); 
    }
    await paymentModule.deletePayment(id);
    console.log("Paiement supprimé avec succès.");
  } catch (error) {
    console.error("Erreur : ID de paiement non trouvé");
  }
  paymentMenu();
};
const handleViewPaymentById = async () => {
  const id = await promptForValidInput("ID du paiement à voir : ", /^[0-9]+$/, "L'ID du paiement est obligatoire.");

  try {
    const payment = await paymentModule.getPaymentById(id);
    if (!payment) {
      console.error("Le paiement avec cet ID n'existe pas.");
      return handleViewPaymentById(); 
    }
    console.table([payment]);
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement : " + error.message);
  }
  paymentMenu();
};
const promptForValidInput = (question, regex, errorMessage) => {
  return new Promise((resolve) => {
    rl.question(question, (input) => {
      if (!input.match(regex)) {
        console.error(errorMessage);
        return resolve(promptForValidInput(question, regex, errorMessage)); 
      }
      resolve(input);
    });
  });
};

// Fonction pour afficher le menu des produits
async function productMenu() {
  console.log("\n=== Menu Produits ===");
  console.log("1. Voir tous les produits");
  console.log("2. Ajouter un produit");
  console.log("3. Mettre à jour un produit");
  console.log("4. Supprimer un produit");
  console.log("5. Voir un produit par ID");
  console.log("6. Retour au menu principal");

  rl.question("Choisissez une option : ", async (option) => {
  try {
    switch (option) {
      case "1":
        const products = await productModule.getProducts();
        console.table(products);
        productMenu();
        break;
      case "2":
        await addProductFlow();
        break;
      case "3":
        await updateProductFlow();
        break;
      case "4":
        await deleteProductFlow();
        break;
      case "5":
        await viewProductFlow();
        break;
        case "6":
          console.log(""); 
          mainMenu(); 
          break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        console.log("");
        productMenu();
        break;
    }
  } catch (error) {
    console.error("Erreur:", error.message);
    console.log("");
    productMenu();
  }
});
};
async function addProductFlow() {
    const name = await promptValidInput("Nom : ", validateProductName);
    const description = await promptValidInput("Description : ", validateProductDescription);
    const price = await promptValidInput("Prix : ", validateProductPrice);
    const stock = await promptValidInput("Stock : ", validateProductStock);
    const category = await promptValidInput("Catégorie : ", validateProductCategory);
    const barcode = await promptValidInput("Code-barres : ", validateProductBarcode);
    const status = await promptValidInput("Statut : ", validateProductStatus);
    try { await productModule.addProduct(name, description, price, stock, category, barcode, status);
    console.log("Produit ajouté avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error.message);
  }
  console.log("");
  productMenu();
}

// Fonction pour mettre à jour un produit
async function updateProductFlow() {
  const id = await askQuestion("ID du produit à mettre à jour : ");
  const name = await promptValidInput("Nom : ", validateProductName);
  const description = await promptValidInput("Description : ", validateProductDescription);
  const price = await promptValidInput("Prix : ", validateProductPrice);
  const stock = await promptValidInput("Stock : ", validateProductStock);
  const category = await promptValidInput("Catégorie : ", validateProductCategory);
  const barcode = await promptValidInput("Code-barres : ", validateProductBarcode);
  const status = await promptValidInput("Statut : ", validateProductStatus);

  try {
      await productModule.updateProduct(id, name, description, price, stock, category, barcode, status);
      console.log("Produit mis à jour avec succès.");
  } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error.message);
  }
  console.log(""); 
  await productMenu();
}
async function deleteProductFlow() {
  try {
    const id = await askQuestion("ID du produit à supprimer : ");
    const { message } = await productModule.deleteProduct(id);
    console.log(message);
  } catch (error) {

    console.error("");
  }
  console.log(""); 
  productMenu();
}
async function viewProductFlow() {
  try {
    const id = await askQuestion("ID du produit à voir : ");
    const product = await productModule.getProductById(id);
    console.table([product]);
  } catch (error) {
    console.error("");
  }
  productMenu();
}
function validateProductName(name) {
  if (!/^[A-Za-z\s]+$/.test(name)) {
    throw new Error("Le nom du produit est invalide.");
  }
}

function validateProductDescription(description) {
  if (!/^[A-Za-z\s]+$/.test(description))  {
    throw new Error("La description du produit est type text.");
  }
}

function validateProductPrice(price) {
  if (!/^[\d]+(\.\d{1,2})?$/.test(price)) {
    throw new Error("Le prix du produit est invalide.");
  }
}

function validateProductStock(stock) {
  if (!/^[0-9]+$/.test(stock)) {
    throw new Error("Le stock du produit doit être un nombre entier.");
  }
}

function validateProductCategory(category) {
  if (!/^[A-Za-z\s]+$/.test(category)) {
    throw new Error("Le format invalide.");
  }
}

function validateProductBarcode(barcode) {
  if (!/^[0-9]+$/.test(barcode)) {
    throw new Error("Le code-barres du produit doit être un nombre.");
  }
}

function validateProductStatus(status) {
  const validStatuses = ['Disponible', 'Indisponible'];
  if (!validStatuses.includes(status)) {
    throw new Error("Le statut du produit est invalide. Choisissez 'Disponible' ou 'Indisponible'.");
  }
  console.log("Produit ajouté avec succès.");
  productMenu();
}


let tempOrderDetails = [];
let newOrder = null;

const orderMenu = () => {
  console.log("\n=== Menu Commandes ===");
  console.log("1. Voir toutes les commandes");
  console.log("2. Ajouter une commande");
  console.log("3. Mettre à jour une commande");
  console.log("4. Supprimer une commande");
  console.log("5. Voir une commande par ID");
  console.log("6. Retour au menu principal");
  console.log("7. Quitter");

  rl.question("Choisissez une option : ", (option) => {
    switch (option) {
      case "1":
        voirCommandes();
        break;
      case "2":
        ajouterCommande();
        break;
      case "3":
        miseAJourCommande();
        break;
      case "4":
        supprimerCommande();
        break;
      case "5":
        voirCommandeParId();
        break;
      case "6":
        mainMenu();
        break;
      case "7":
        console.log("Au revoir !");
        rl.close();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        orderMenu();
        break;
    }
  });
};

const voirCommandes = async () => {
  try {
    const orders = await orderModule.getPurchaseOrders();
    
    if (!orders || orders.length === 0) {
      console.log("Aucune commande disponible à afficher.");
      orderMenu();
      return;
    }

    orders.forEach(order => {
      console.log(`Commande ID: ${order.id}`);
      console.log(`Date: ${order.date}`);
      console.log(`Adresse de livraison: ${order.delivery_address}`);
      console.log(`Numéro de suivi: ${order.track_number}`);
      console.log(`Statut: ${order.status}`);
      console.log(`Client ID: ${order.customer_id}`);
      console.log("\nDétails de la commande :");

      if (order.details && order.details.length > 0) {
        order.details.forEach(detail => {
          console.log(`  Produit ID: ${detail.product_id}`);
          console.log(`  Quantité: ${detail.quantity}`);
          console.log(`  Prix: ${detail.price}`);
          console.log("  ---");
        });
      } else {
        console.log("  Aucun détail disponible.");
      }
      console.log("\n=========================");
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des commandes :", error.message);
  }
  orderMenu();
};

const voirCommandeParId = async () => {
  rl.question("Entrez l'ID de la commande : ", async (id) => {
    try {
      const order = await orderModule.getPurchaseOrderById(id);
      
      if (!order) {
        console.log("Aucune commande trouvée avec cet ID.");
        orderMenu();
        return;
      }

      console.log(`Commande ID: ${order.id}`);
      console.log(`Date: ${order.date}`);
      console.log(`Adresse de livraison: ${order.delivery_address}`);
      console.log(`Numéro de suivi: ${order.track_number}`);
      console.log(`Statut: ${order.status}`);
      console.log(`Client ID: ${order.customer_id}`);
      console.log("\nDétails de la commande :");

      if (order.details && order.details.length > 0) {
        order.details.forEach(detail => {
          console.log(`  Produit ID: ${detail.product_id}`);
          console.log(`  Quantité: ${detail.quantity}`);
          console.log(`  Prix: ${detail.price}`);
          console.log("  ---");
        });
      } else {
        console.log("  Aucun détail disponible.");
      }
    } catch (error) {
      console.error("Erreur lors de l'affichage de la commande :", error.message);
    }
    orderMenu();
  });
};

const ajouterCommande = () => {
  console.log("\n=== Ajouter une commande ===");
  askForDate(date => {
    askForDeliveryAddress(delivery_address => {
      askForTrackNumber(track_number => {
        askForStatus(status => {
          askForCustomerId(customer_id => {
            newOrder = {
              date,
              delivery_address,
              track_number,
              status,
              customer_id,
              details: tempOrderDetails,
            };

            console.log("Commande initialisée. Veuillez ajouter des détails de commande.");
            ajouterDetailsCommandeMenu();
          });
        });
      });
    });
  });
};

const ajouterDetailsCommandeMenu = () => {
  console.log("\n=== Détails de commande ===");
  console.log("1 : Ajouter détail commande");
  console.log("2 : Sauvegarder la commande");
  console.log("3 : Retour au menu");

  rl.question("Choisissez une option : ", (subOption) => {
    switch (subOption) {
      case "1":
        ajouterProduit();
        break;
      case "2":
        enregistrerCommande();
        break;
      case "3":
        orderMenu();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        ajouterDetailsCommandeMenu();
        break;
    }
  });
};

const ajouterProduit = () => {
  askForProductId(product_id => {
    askForQuantity(quantity => {
      askForPrice(price => {
        tempOrderDetails.push({
          product_id,
          quantity,
          price
        });

        console.log(`Produit ajouté : ID ${product_id}, Quantité ${quantity}, Prix ${price}`);
        ajouterDetailsCommandeMenu();
      });
    });
  });
};

const enregistrerCommande = async () => {
  try {
    if (!newOrder || !newOrder.details || newOrder.details.length === 0) {
      console.error("Erreur : La commande doit comporter au moins un produit.");
      ajouterDetailsCommandeMenu();
      return;
    }

    await orderModule.addPurchaseOrder(newOrder);

    tempOrderDetails = [];
    newOrder = null;

    console.log("Commande enregistrée avec succès.");
    orderMenu();

  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la commande :", error.message);
    ajouterDetailsCommandeMenu();
  }
};


const miseAJourCommande = () => {
  rl.question("ID de la commande à mettre à jour : ", async (id) => {
    try {
      const order = await orderModule.getPurchaseOrderById(id);

      if (!order) {
        console.log("Aucune commande trouvée avec cet ID.");
        orderMenu();
        return;
      }

      console.log("\nDétails actuels de la commande :");
      console.log(`Date: ${order.date}`);
      console.log(`Adresse de livraison: ${order.delivery_address}`);
      console.log(`Numéro de suivi: ${order.track_number}`);
      console.log(`Statut: ${order.status}`);
      console.log(`Client ID: ${order.customer_id}`);
      console.log("\n=== Détails des produits ===");

      order.details.forEach((detail, index) => {
        console.log(`Produit ${index + 1}:`);
        console.log(`  Produit ID: ${detail.product_id}`);
        console.log(`  Quantité: ${detail.quantity}`);
        console.log(`  Prix: ${detail.price}`);
        console.log("  ---");
      });

   
      const demanderNouvelleDate = (callback) => {
        rl.question("\nNouvelle date (YYYY-MM-DD) ou laissez vide pour conserver : ", (newDate) => {
          if (newDate && !isValidDate(newDate)) {
            console.log("Format de date invalide. Veuillez saisir une date valide (YYYY-MM-DD).");
            demanderNouvelleDate(callback);
          } else {
            callback(newDate);
          }
        });
      };

      const demanderNouvelleAdresse = (callback) => {
        rl.question("Nouvelle adresse de livraison ou laissez vide pour conserver : ", (newDeliveryAddress) => {
          if (newDeliveryAddress && typeof newDeliveryAddress !== "string") {
            console.log("L'adresse de livraison doit contenir uniquement du texte.");
            demanderNouvelleAdresse(callback); 
          } else {
            callback(newDeliveryAddress);
          }
        });
      };

     
      const demanderNouveauNumeroSuivi = (callback) => {
        rl.question("Nouveau numéro de suivi ou laissez vide pour conserver : ", (newTrackNumber) => {
          if (newTrackNumber && (!Number.isInteger(parseInt(newTrackNumber)) || parseInt(newTrackNumber) <= 0)) {
            console.log("Le numéro de suivi doit être un nombre entier positif.");
            demanderNouveauNumeroSuivi(callback);
          } else {
            callback(newTrackNumber);
          }
        });
      };

      const demanderNouveauStatut = (callback) => {
        rl.question("Nouveau statut ou laissez vide pour conserver : ", (newStatus) => {
          if (newStatus && typeof newStatus !== "string") {
            console.log("Le statut doit contenir uniquement du texte.");
            demanderNouveauStatut(callback); 
          } else {
            callback(newStatus);
          }
        });
      };

      const demanderNouvelIDClient = (callback) => {
        rl.question("Nouvel ID de client ou laissez vide pour conserver : ", (newCustomerId) => {
          if (newCustomerId && !/^[0-9]+$/.test(newCustomerId)) {
            console.log("L'ID du client doit être un chiffre.");
            demanderNouvelIDClient(callback); 
          } else {
            callback(newCustomerId);
          }
        });
      };

      demanderNouvelleDate((newDate) => {
        demanderNouvelleAdresse((newDeliveryAddress) => {
          demanderNouveauNumeroSuivi((newTrackNumber) => {
            demanderNouveauStatut((newStatus) => {
              demanderNouvelIDClient(async (newCustomerId) => {
                console.log("\n=== Mise à jour des détails des produits ===");
                let updatedDetails = [...order.details];

                const modifierDetails = (index = 0) => {
                  if (index >= updatedDetails.length) {
                    terminerMiseAJour({
                      id: order.id,
                      date: newDate || order.date,
                      delivery_address: newDeliveryAddress || order.delivery_address,
                      track_number: newTrackNumber || order.track_number,
                      status: newStatus || order.status,
                      customer_id: newCustomerId || order.customer_id,
                      details: updatedDetails
                    });
                    return;
                  }

                  const detail = updatedDetails[index];
                  console.log(`\nModification du produit ${index + 1}`);
                  rl.question(`Nouvel ID du produit (actuel: ${detail.product_id}) ou laissez vide pour conserver : `, (newProductId) => {
                    rl.question(`Nouvelle quantité (actuelle: ${detail.quantity}) ou laissez vide pour conserver : `, (newQuantity) => {
                      if (newQuantity && (!Number.isInteger(parseInt(newQuantity)) || parseInt(newQuantity) <= 0)) {
                        console.log("La quantité doit être un nombre entier positif.");
                        modifierDetails(index); 
                        return;
                      }
                      rl.question(`Nouveau prix (actuel: ${detail.price}) ou laissez vide pour conserver : `, (newPrice) => {
                        if (newPrice && (!/^\d+(\.\d{1,2})?$/.test(newPrice) || parseFloat(newPrice) <= 0)) {
                          console.log("Le prix doit être un nombre décimal positif avec deux chiffres après la virgule.");
                          modifierDetails(index); 
                          return;
                        }
                        updatedDetails[index] = {
                          product_id: newProductId || detail.product_id,
                          quantity: newQuantity || detail.quantity,
                          price: newPrice || detail.price
                        };
                        modifierDetails(index + 1);
                      });
                    });
                  });
                };

                const terminerMiseAJour = async (updatedOrder) => {
                  try {
                    await orderModule.updatePurchaseOrder(id, updatedOrder);
                    console.log("Commande mise à jour avec succès.");
                  } catch (error) {
                    console.error("Erreur lors de la mise à jour de la commande :", error.message);
                  }
                  orderMenu();
                };

                modifierDetails();
              });
            });
          });
        });
      });

    } catch (error) {
      console.error("Erreur lors de la récupération de la commande :", error.message);
      orderMenu();
    }
  });
};

const supprimerCommande = () => {
  rl.question("Entrez l'ID de la commande à supprimer : ", async (id) => {
    try {
      await orderModule.deletePurchaseOrder(id);
      console.log("Commande supprimée avec succès.");
      orderMenu();
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande :", error.message);
      orderMenu();
    }
  });
};
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};
const askForDate = (callback) => {
  rl.question("Date (YYYY-MM-DD) : ", (date) => {
    if (!date || !isValidDate(date)) {
      console.error("Erreur : Le format de la date est invalide.");
      askForDate(callback);
      return;
    }
    callback(date);
  });
};
const askForDeliveryAddress = (callback) => {
  rl.question("Adresse de livraison : ", (delivery_address) => {
    if (!delivery_address || typeof delivery_address !== "string") {
      console.error("Erreur : L'adresse de livraison est invalide ou vide.");
      askForDeliveryAddress(callback);
      return;
    }
    callback(delivery_address);
  });
};
const askForTrackNumber = (callback) => {
  rl.question("Numéro de suivi : ", (track_number) => {
    const parsedTrackNumber = parseInt(track_number, 10);
    if (isNaN(parsedTrackNumber) || parsedTrackNumber <= 0) {
      console.error("Erreur : Le numéro de suivi doit être un nombre entier positif.");
      askForTrackNumber(callback);  
      return;
    }
    callback(parsedTrackNumber);  
  });
};
const askForStatus = (callback) => {
  rl.question("Statut : ", (status) => {
    if (!status || typeof status !== "string") {
      console.error("Erreur : Le statut doit contenir du texte.");
      askForStatus(callback);
      return;
    }
    callback(status);
  });
};
const askForCustomerId = (callback) => {
  rl.question("ID du client : ", (customer_id) => {
    if (!customer_id || isNaN(customer_id) || parseInt(customer_id) <= 0) {
      console.error("Erreur : L'ID du client doit être un entier positif.");
      askForCustomerId(callback);
      return;
    }
    callback(customer_id);
  });
};
const askForProductId = (callback) => {
  rl.question("ID du produit : ", (product_id) => {
    if (!product_id || isNaN(product_id) || parseInt(product_id) <= 0) {
      console.error("Erreur : L'ID du produit doit être un entier positif.");
      askForProductId(callback);
      return;
    }
    callback(product_id);
  });
};
const askForQuantity = (callback) => {
  rl.question("Quantité : ", (quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      console.error("Erreur : La quantité doit être un nombre entier positif.");
      askForQuantity(callback);  
      return;
    }
    callback(parsedQuantity);  
  });
};
const askForPrice = (callback) => {
  rl.question("Prix : ", (price) => {
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      console.error("Erreur : Le prix doit être un nombre positif.");
      askForPrice(callback);
      return;
    }
    callback(price);
  });
};

mainMenu();
