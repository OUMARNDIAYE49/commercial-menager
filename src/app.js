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
                      console.error("");
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
              console.error("Impossible de supprimer ce client :", error.message);
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
                      console.error("");
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
              console.error("");
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
              console.error("");
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
                            console.error("");
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
              console.error("");
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
              console.error("");
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

let tempOrderDetails = [];
let newOrder = null;

// Fonction principale du menu des commandes
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

const ajouterCommande = async () => {
  console.log("\n=== Ajouter une commande ===");
  rl.question("Date (YYYY-MM-DD) : ", (date) => {
    rl.question("Adresse de livraison : ", (delivery_address) => {
      rl.question("Numéro de suivi : ", (track_number) => {
        rl.question("Statut : ", (status) => {
          rl.question("ID du client : ", (customer_id) => {
            if (!date || !delivery_address || !track_number || !status || !customer_id) {
              console.error("Erreur : Toutes les entrées sont obligatoires.");
              orderMenu();
              return;
            }

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
  rl.question("ID du produit : ", (product_id) => {
    rl.question("Quantité : ", (quantity) => {
      rl.question("Prix : ", (price) => {
        if (!product_id || !quantity || !price) {
          console.error("Erreur : Toutes les entrées de produit sont obligatoires.");
          ajouterDetailsCommandeMenu();
          return;
        }

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
      console.error("Erreur : La commande ne peut pas être vide et doit avoir au moins un détail de produit.");
      ajouterDetailsCommandeMenu();
      return;
    }

    await orderModule.addPurchaseOrder(newOrder);
    tempOrderDetails = [];
    newOrder = null;
    console.log("Commande enregistrée avec succès.");
    orderMenu();
  } catch (error) {
    console.error(" le client n'existe pas");
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

      rl.question("\nNouvelle date (YYYY-MM-DD) ou laissez vide pour conserver : ", (newDate) => {
        rl.question("Nouvelle adresse de livraison ou laissez vide pour conserver : ", (newDeliveryAddress) => {
          rl.question("Nouveau numéro de suivi ou laissez vide pour conserver : ", (newTrackNumber) => {
            rl.question("Nouveau statut ou laissez vide pour conserver : ", (newStatus) => {
              rl.question("Nouvel ID de client ou laissez vide pour conserver : ", async (newCustomerId) => {

               
                console.log("\n=== Mise à jour des détails des produits ===");
                let updatedDetails = [...order.details]; 
                
                const modifierDetails = (index = 0) => {
                  if (index >= updatedDetails.length) {
                    terminerMiseAJour(updatedOrder);
                    return;
                  }

                  const detail = updatedDetails[index];
                  console.log(`\nModification du produit ${index + 1}`);
                  rl.question(`Nouvel ID du produit (actuel: ${detail.product_id}) ou laissez vide pour conserver : `, (newProductId) => {
                    rl.question(`Nouvelle quantité (actuelle: ${detail.quantity}) ou laissez vide pour conserver : `, (newQuantity) => {
                      rl.question(`Nouveau prix (actuel: ${detail.price}) ou laissez vide pour conserver : `, (newPrice) => {

                        
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
                const updatedOrder = {
                  id: order.id,
                  date: newDate || order.date,
                  delivery_address: newDeliveryAddress || order.delivery_address,
                  track_number: newTrackNumber || order.track_number,
                  status: newStatus || order.status,
                  customer_id: newCustomerId || order.customer_id,
                  details: updatedDetails 
                };ts
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
  rl.question("ID de la commande à supprimer : ", async (id) => {
    try {
      await orderModule.deletePurchaseOrder(id);
      console.log("Commande supprimée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande :", error.message);
    }
    orderMenu();
  });
};

console.log("Bienvenue dans l'application de gestion des données.");
mainMenu();
