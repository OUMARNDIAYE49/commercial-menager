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
    if (await customerModule.doesEmailExist(email)) {
      throw new Error("Cet email existe déjà.");
    }
    if (await customerModule.doesPhoneExist(phone)) {
      throw new Error("Ce numéro de téléphone existe déjà.");
    }
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
    const existingCustomer = await customerModule.getCustomerById(id);
    if (!existingCustomer) {
      throw new Error("Le client n'existe pas.");
    }
    if (await customerModule.doesEmailExist(email) && email !== existingCustomer.email) {
      throw new Error("Cet email existe déjà.");
    }
    if (await customerModule.doesPhoneExist(phone) && phone !== existingCustomer.phone) {
      throw new Error("Ce numéro de téléphone existe déjà.");
    }
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
  if (name.length === 0 || name.length > 255) {
    throw new Error("Le nom doit contenir entre 1 et 255 caractères.");
  }
}

function validateEmail(email) {
  const emailRegex = /^.+@.+\..+$/
  if (!emailRegex.test(email)) {
    throw new Error("L'email est invalide.");
  }
}

function validatePhone(phone) {
  if (phone.length === 0 || phone.length > 20) {
    throw new Error("Le numéro de téléphone doit contenir entre 1 et 20 caractères.");
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
      return AddPayment(); 
    }
    await paymentModule.addPayment(order_id, date, amount, payment_method);
    console.log("Paiement ajouté avec succès.");
  } catch (error) {
    console.error("");
  }
  paymentMenu();
};

const handleUpdatePayment = async () => {
 
  const id = await promptForValidInput("ID du paiement à mettre à jour : ", /^[0-9]+$/, "L'ID du paiement est obligatoire et doit être un nombre entier.");
  const order_id = await promptForValidInput("ID de la commande : ", /^[0-9]+$/, "L'ID de commande est obligatoire et doit être un nombre entier.");
  const date = await promptForValidInput("Date (YYYY-MM-DD) : ", /^\d{4}-\d{2}-\d{2}$/, "Format de date invalide. Veuillez utiliser le format YYYY-MM-DD.");
  const amount = await promptForValidInput("Montant : ", /^[0-9]+(\.[0-9]{1,2})?$/, "Veuillez saisir un nombre entier ou un décimal valide.");
  const payment_method = await promptForValidInput("Méthode de paiement : ", /^.+$/, "La méthode de paiement est obligatoire et doit être un texte valide.");

  try {
    const existingPayment = await paymentModule.getPaymentById(id);
    if (!existingPayment) {
      console.error("Le paiement avec cet ID n'existe pas.");
      return handleUpdatePayment(); 
    }
   
    await paymentModule.updatePayment(id, order_id, date, amount, payment_method);
    console.log("Paiement mis à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement : ", error.message);
  }

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
    console.log("");
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
}

async function addProductFlow() {
  const name = await promptValidInput("Nom : ", validateProductName);
  const description = await promptValidInput("Description : ", validateProductDescription);
  const price = await promptValidInput("Prix : ", validateProductPrice);
  const stock = await promptValidInput("Stock : ", validateProductStock);
  const category = await promptValidInput("Catégorie : ", validateProductCategory);
  const barcode = await promptValidInput("Code-barres : ", validateProductBarcode);
  const status = await promptValidInput("Statut : ", validateProductStatus);
  
  try {
    await productModule.addProduct(name, description, price, stock, category, barcode, status);
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
    console.error("Erreur lors de la suppression du produit :", error.message);
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
    console.error("Erreur lors de la récupération du produit :", error.message);
  }
  productMenu();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function promptValidInput(prompt, validator) {
  while (true) {
    const input = await askQuestion(prompt);
    try {
      validator(input);
      return input;
    } catch (error) {
      console.error(error.message);
    }
  }
}

function validateProductName(name) {
  if (!/^.{1,255}$/.test(name)) {
    throw new Error("Le nom du produit est invalide. Il doit contenir entre 1 et 255 caractères.");
  }
}

function validateProductDescription(description) {
  if (description.length === 0) {
    throw new Error("La description du produit est invalide. Elle ne peut pas être vide.");
  }
}

function validateProductPrice(price) {
  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(price) || parseFloat(price) < 0 || parseFloat(price) > 99999999.99) {
    throw new Error("Le prix du produit est invalide. Il doit être un nombre décimal valide avec jusqu'à 2 décimales.");
  }
}

function validateProductStock(stock) {
  if (!/^[0-9]+$/.test(stock)) {
    throw new Error("Le stock du produit est invalide. Il doit être un nombre entier.");
  }
}

function validateProductCategory(category) {
  if (!/^.{1,100}$/.test(category)) {
    throw new Error("La catégorie du produit est invalide. Elle doit contenir entre 1 et 100 caractères.");
  }
}

function validateProductBarcode(barcode) {
  if (!/^.{1,50}$/.test(barcode)) {
    throw new Error("Le code-barres du produit est invalide. Il doit contenir entre 1 et 50 caractères.");
  }
}

function validateProductStatus(status) {
  if (typeof status !== 'string' || status.length > 50) {
    throw new Error("Le statut du produit est invalide. Il doit être une chaîne de caractères ne dépassant pas 50 caractères.");
  }
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

const isPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
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

      const demandeSaisieValidée = (question, validationFunction) => {
        return new Promise((resolve) => {
          const poserQuestion = () => {
            rl.question(question, (input) => {
              if (validationFunction(input)) {
                resolve(input);
              } else {
                console.log("Saisie invalide. Veuillez réessayer.");
                poserQuestion();
              }
            });
          };
          poserQuestion();
        });
      };

      const miseAJour = async () => {
        const newDate = await demandeSaisieValidée("Nouvelle date (format AAAA-MM-JJ) : ", isValidDate);
        const newDeliveryAddress = await demandeSaisieValidée("Nouvelle adresse de livraison : ", (input) => input.length > 0);
        const newTrackNumber = await demandeSaisieValidée("Nouveau numéro de suivi : ", (input) => input.length > 0 && input.length <= 100);
        const newStatus = await demandeSaisieValidée("Nouveau statut : ", (input) => input.length > 0 && input.length <= 50);
        const newCustomerId = await demandeSaisieValidée("Nouvel ID de client : ", (input) => !isNaN(input) && input > 0);

        const newDetails = [];
        for (let i = 0; i < order.details.length; i++) {
          console.log(`\nMise à jour du produit ${i + 1} :`);

          const newProductId = await demandeSaisieValidée(
            `Nouvel ID produit pour le produit ${i + 1} (actuel: ${order.details[i].product_id}) : `,
            (input) => !isNaN(input) && input > 0
          );
          const newQuantity = await demandeSaisieValidée(
            `Nouvelle quantité pour le produit ${i + 1} (actuel: ${order.details[i].quantity}) : `,
            isPositiveInteger 
          );
          const newPrice = await demandeSaisieValidée(
            `Nouveau prix pour le produit ${i + 1} (actuel: ${order.details[i].price}) : `,
            (input) => !isNaN(input) && input > 0
          );

          newDetails.push({
            product_id: Number(newProductId),
            quantity: Number(newQuantity), 
            price: Number(newPrice)
          });
        }

        const updatedOrder = {
          date: newDate,
          delivery_address: newDeliveryAddress,
          track_number: newTrackNumber,
          status: newStatus,
          customer_id: newCustomerId,
          details: newDetails
        };

        enregistrerCommandeMiseAJour(id, updatedOrder);
      };

      miseAJour();

    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande :", error.message);
      orderMenu();
    }
  });
};

const enregistrerCommandeMiseAJour = async (id, updatedOrder) => {
  try {
    await orderModule.updatePurchaseOrder(id, updatedOrder);
    console.log("Commande mise à jour avec succès.");
    orderMenu();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error.message);
    orderMenu();
  }
};



const supprimerCommande = () => {
  rl.question("ID de la commande à supprimer : ", async (id) => {
    try {
      const order = await orderModule.getPurchaseOrderById(id);

      if (!order) {
        console.log("Aucune commande trouvée avec cet ID.");
        orderMenu();
        return;
      }

      await orderModule.deletePurchaseOrder(id);
      console.log(`La commande avec l'ID ${id} a été supprimée avec succès.`);
      orderMenu();
    } catch (error) {
      console.error(error.message);
      orderMenu();
    }
  });
};



const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  return !isNaN(timestamp) && date.toISOString().startsWith(dateString);
};

// Fonctions pour demander des entrées utilisateur
const askForDate = (callback) => {
  rl.question("Date (YYYY-MM-DD) : ", (date) => {
    if (isValidDate(date)) {
      callback(date);
    } else {
      console.log("Format de date invalide. Veuillez saisir une date valide (YYYY-MM-DD).");
      askForDate(callback);
    }
  });
};

const askForDeliveryAddress = (callback) => {
  rl.question("Adresse de livraison : ", (address) => {
    if (typeof address === "string") {
      callback(address);
    } else {
      console.log("L'adresse de livraison doit contenir uniquement du texte.");
      askForDeliveryAddress(callback);
    }
  });
};

const askForTrackNumber = (callback) => {
  rl.question("Numéro de suivi : ", (trackNumber) => {
    if (trackNumber.length <= 100) {
      callback(trackNumber);
    } else {
      console.log("Le numéro de suivi doit être une chaîne de caractères de moins de 100 caractères.");
      askForTrackNumber(callback);
    }
  });
};

const askForStatus = (callback) => {
  rl.question("Statut : ", (status) => {
    if (status.length <= 50) {
      callback(status);
    } else {
      console.log("Le statut doit être une chaîne de caractères de moins de 50 caractères.");
      askForStatus(callback);
    }
  });
};

const askForCustomerId = (callback) => {
  rl.question("ID du client : ", (customerId) => {
    if (!isNaN(customerId)) {
      callback(customerId);
    } else {
      console.log("L'ID client doit être un nombre.");
      askForCustomerId(callback);
    }
  });
};

const askForProductId = (callback) => {
  rl.question("ID du produit : ", (productId) => {
    callback(productId);
  });
};

const askForQuantity = (callback) => {
  rl.question("Quantité : ", (quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      callback(parsedQuantity);
    } else {
      console.log("La quantité doit être un entier positif.");
      askForQuantity(callback);
    }
  });
};

const askForPrice = (callback) => {
  rl.question("Prix : ", (price) => {
    const parsedPrice = parseFloat(price);
    if (!isNaN(parsedPrice) && parsedPrice >= 0 && price.match(/^\d+(\.\d{1,2})?$/)) {
      callback(parsedPrice);
    } else {
      console.log("Le prix doit être un nombre décimal avec jusqu'à 2 chiffres après la virgule.");
      askForPrice(callback);
    }
  });
};

mainMenu();
