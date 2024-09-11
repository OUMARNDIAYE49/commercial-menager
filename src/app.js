const readline = require("readline");
const customerModule = require("./customerModule");
const paymentModule = require("./paymentModule");
const productModule = require("./productModule");
const orderModule = require("./purchaseOrderModule");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
        mainMenus();
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

// Fonction pour afficher le menu des clients
const customerMenu = () => {
  console.log("\n=== Menu Clients ===");
  console.log("1. Voir tous les clients");
  console.log("2. Ajouter un client");
  console.log("3. Mettre à jour un client");
  console.log("4. Supprimer un client");
  console.log("5. Voir un client par ID");
  console.log("6. Retour au menu principal");

  rl.question("Choisissez une option : ", async (option) => {
    try {
      switch (option) {
        case "1":
          const customers = await customerModule.getCustomers();
          console.table(customers);
          customerMenu();
          break;
        case "2":
          rl.question("Nom : ", (name) => {
            rl.question("Email : ", (email) => {
              rl.question("Téléphone : ", (phone) => {
                rl.question("Adresse : ", async (address) => {
                  try {
                    await customerModule.addCustomer(name, email, phone, address);
                    console.log("Client ajouté avec succès.");
                  } catch (error) {
                    console.error("Erreur lors de l'ajout du client :", error.message);
                  }
                  customerMenu();
                });
              });
            });
          });
          break;
        case "3":
          rl.question("ID du client à mettre à jour : ", (id) => {
            rl.question("Nom : ", (name) => {
              rl.question("Email : ", (email) => {
                rl.question("Téléphone : ", (phone) => {
                  rl.question("Adresse : ", async (address) => {
                    try {
                      await customerModule.updateCustomer(id, name, email, phone, address);
                      console.log("Client mis à jour avec succès.");
                    } catch (error) {
                      console.error("Erreur lors de la mise à jour du client :", error.message);
                    }
                    customerMenu();
                  });
                });
              });
            });
          });
          break;
        case "4":
          rl.question("ID du client à supprimer : ", async (id) => {
            try {
              await customerModule.deleteCustomer(id);
              console.log("Client supprimé avec succès.");
            } catch (error) {
              console.error("Imposible de supprimé ce client");
            }
            customerMenu();
          });
          break;
        case "5":
          rl.question("ID du client à voir : ", async (id) => {
            try {
              const customer = await customerModule.getCustomerById(id);
              console.table([customer]);
            } catch (error) {
              console.error("Erreur lors de la récupération du client :", error.message);
            }
            customerMenu();
          });
          break;
        case "6":
          mainMenu();
          break;
        default:
          console.log("Option invalide, veuillez réessayer.");
          customerMenu();
          break;
      }
    } catch (error) {
      console.error("Erreur:", error.message);
      customerMenu();
    }
  });
};

// Fonction pour afficher le menu des paiements
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
          rl.question("ID de la commande : ", (order_id) => {
            rl.question("Date (YYYY-MM-DD) : ", (date) => {
              rl.question("Montant : ", (amount) => {
                rl.question("Méthode de paiement : ", async (payment_method) => {
                  try {
                    await paymentModule.addPayment(order_id, date, amount, payment_method);
                    console.log("Paiement ajouté avec succès.");
                  } catch (error) {
                    console.error("Erreur lors de l'ajout du paiement :", error.message);
                  }
                  paymentMenu();
                });
              });
            });
          });
          break;
        case "3":
          rl.question("ID du paiement à mettre à jour : ", (id) => {
            rl.question("ID de la commande : ", (order_id) => {
              rl.question("Date (YYYY-MM-DD) : ", (date) => {
                rl.question("Montant : ", (amount) => {
                  rl.question("Méthode de paiement : ", async (payment_method) => {
                    try {
                      await paymentModule.updatePayment(id, order_id, date, amount, payment_method);
                      console.log("Paiement mis à jour avec succès.");
                    } catch (error) {
                      console.error("Erreur lors de la mise à jour du paiement :", error.message);
                    }
                    paymentMenu();
                  });
                });
              });
            });
          });
          break;
        case "4":
          rl.question("ID du paiement à supprimer : ", async (id) => {
            try {
              await paymentModule.deletePayment(id);
              console.log("Paiement supprimé avec succès.");
            } catch (error) {
              console.error("Erreur lors de la suppression du paiement :", error.message);
            }
            paymentMenu();
          });
          break;
        case "5":
          rl.question("ID du paiement à voir : ", async (id) => {
            try {
              const payment = await paymentModule.getPaymentById(id);
              console.table([payment]);
            } catch (error) {
              console.error("Erreur lors de la récupération du paiement :", error.message);
            }
            paymentMenu();
          });
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


// Fonction pour afficher le menu des produits
const productMenu = () => {
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
          rl.question("Nom : ", (name) => {
            rl.question("Description : ", (description) => {
              rl.question("Prix : ", (price) => {
                rl.question("Stock : ", (stock) => {
                  rl.question("Catégorie : ", (category) => {
                    rl.question("Code-barres : ", (barcode) => {
                      rl.question("Statut : ", async (status) => {
                        try {
                          await productModule.addProduct(name, description, price, stock, category, barcode, status);
                          console.log("Produit ajouté avec succès.");
                        } catch (error) {
                          console.error("Erreur lors de l'ajout du produit :", error.message);
                        }
                        productMenu();
                      });
                    });
                  });
                });
              });
            });
          });
          break;
        case "3":
          rl.question("ID du produit à mettre à jour : ", (id) => {
            rl.question("Nom : ", (name) => {
              rl.question("Description : ", (description) => {
                rl.question("Prix : ", (price) => {
                  rl.question("Stock : ", (stock) => {
                    rl.question("Catégorie : ", (category) => {
                      rl.question("Code-barres : ", (barcode) => {
                        rl.question("Statut : ", async (status) => {
                          try {
                            await productModule.updateProduct(id, name, description, price, stock, category, barcode, status);
                            console.log("Produit mis à jour avec succès.");
                          } catch (error) {
                            console.error("Erreur lors de la mise à jour du produit :", error.message);
                          }
                          productMenu();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          break;
        case "4":
          rl.question("ID du produit à supprimer : ", async (id) => {
            try {
              await productModule.deleteProduct(id);
              console.log("Produit supprimé avec succès.");
            } catch (error) {
              console.error("Erreur lors de la suppression du produit :", error.message);
            }
            productMenu();
          });
          break;
        case "5":
          rl.question("ID du produit à voir : ", async (id) => {
            try {
              const product = await productModule.getProductById(id);
              console.table([product]);
            } catch (error) {
              console.error("Erreur lors de la récupération du produit :", error.message);
            }
            productMenu();
          });
          break;
        case "6":
          mainMenu();
          break;
        default:
          console.log("Option invalide, veuillez réessayer.");
          productMenu();
          break;
      }
    } catch (error) {
      console.error("Erreur:", error.message);
      productMenu();
    }
  });
};


// Fonction principale du menu
const mainMenus = () => {
  console.log("\n=== Menu Commande ===");
  console.log("1 : Voir les commandes");
  console.log("2 : Ajouter une commande");
  console.log("3 : Mettre à jour une commande");
  console.log("4 : Supprimer une commande");
  console.log("5 : Retour au menu principal");
  console.log("6 : Quitter");

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
        mainMenu();
        break;
      case "6":
        console.log("Au revoir !");
        rl.close();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        mainMenus();
        break;
    }
  });
};

// Afficher toutes les commandes
const voirCommandes = async () => {
  try {
    const orders = await orderModule.getPurchaseOrders();
    orders.forEach(order => {
      console.log(`Commande ID: ${order._id}`);
      console.log(`Date: ${order.date}`);
      console.log(`Adresse de livraison: ${order.delivery_address}`);
      console.log(`Numéro de suivi: ${order.track_number}`);
      console.log(`Statut: ${order.status}`);
      console.log(`Client ID: ${order.customer_id}`);
      console.log("\nDétails de la commande :");
      if (order.details.length > 0) {
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
  mainMenus();
};

// Variables pour stocker la commande et ses détails
let tempOrderDetails = [];
let newOrder = null;

// Ajouter une nouvelle commande
const ajouterCommande = async () => {
  console.log("\n=== Ajouter une commande ===");
  rl.question("Date (YYYY-MM-DD) : ", (date) => {
    rl.question("Adresse de livraison : ", (delivery_address) => {
      rl.question("Numéro de suivi : ", (track_number) => {
        rl.question("Statut : ", (status) => {
          rl.question("ID du client : ", (customer_id) => {
            // Validation des entrées pour s'assurer qu'elles ne sont pas undefined ou vides
            if (!date || !delivery_address || !track_number || !status || !customer_id) {
              console.error("Erreur : Toutes les entrées sont obligatoires.");
              mainMenus();
              return;
            }

            // Créer un nouvel objet commande sans encore l'enregistrer
            newOrder = {
              date,
              delivery_address,
              track_number,
              status,
              customer_id,
              details: tempOrderDetails, // Ajouter les détails des produits
            };

            console.log("Commande initialisée. Veuillez ajouter des détails de commande.");
            ajouterDetailsCommandeMenu(); // Rediriger vers le sous-menu pour ajouter des produits
          });
        });
      });
    });
  });
};

// Sous-menu pour ajouter des détails de commande
const ajouterDetailsCommandeMenu = () => {
  console.log("\n=== Ajouter détails de commande ===");
  console.log("1 : Ajouter un produit");
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
        mainMenus();
        break;
      default:
        console.log("Option invalide, veuillez réessayer.");
        ajouterDetailsCommandeMenu();
        break;
    }
  });
};

// Ajouter les détails d'un produit à la commande
const ajouterProduit = () => {
  rl.question("ID du produit : ", (product_id) => {
    rl.question("Quantité : ", (quantity) => {
      rl.question("Prix : ", (price) => {
        // Validation pour s'assurer que tous les champs sont remplis
        if (!product_id || !quantity || !price) {
          console.error("Erreur : Toutes les entrées de produit sont obligatoires.");
          ajouterDetailsCommandeMenu();
          return;
        }

        // Ajouter le produit temporairement à la commande en cours
        tempOrderDetails.push({
          product_id,
          quantity,
          price
        });
        console.log(`Produit ajouté : ID ${product_id}, Quantité ${quantity}, Prix ${price}`);
        ajouterDetailsCommandeMenu(); // Retour au sous-menu pour permettre d'ajouter plus de produits ou sauvegarder
      });
    });
  });
};

// Enregistrer la commande avec les détails ajoutés
const enregistrerCommande = async () => {
  try {
    if (!newOrder || !newOrder.details || newOrder.details.length === 0) {
      console.error("Erreur : La commande ne peut pas être vide et doit avoir au moins un détail de produit.");
      ajouterDetailsCommandeMenu();
      return;
    }

    // Ajouter la nouvelle commande
    await orderModule.addPurchaseOrder(newOrder);
    tempOrderDetails = []; // Réinitialiser la liste des détails après enregistrement
    newOrder = null; // Réinitialiser la commande après enregistrement
    console.log("Commande enregistrée avec succès.");
    mainMenus();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la commande :", error.message);
    ajouterDetailsCommandeMenu();
  }
};



  
// Fonction pour mettre à jour une commande
const miseAJourCommande = () => {
  rl.question("ID de la commande à mettre à jour : ", async (id) => {
    
    // Logique pour mettre à jour la commande
    console.log(`Commande ${id} mise à jour.`);
    mainMenus();
  });
};

// Fonction pour supprimer une commande
const supprimerCommande = () => {
  rl.question("ID de la commande à supprimer : ", async (id) => {
    try {
      await orderModule.deletePurchaseOrder(id);
      console.log("Commande supprimée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande :", error.message);
    }
    mainMenus();
  });
};

  

console.log("Bienvenue dans l'application de gestion des données.");
mainMenu();
