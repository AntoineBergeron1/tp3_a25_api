import { Router } from 'express';
import Auteur from '../models/auteur.mjs';
import Categorie from '../models/categorie.mjs';
import Livre from '../models/livre.mjs';
import User from '../models/user.mjs';
import Panier from '../models/panier.mjs';

const router = Router();

/**
 * Route pour initialiser la base de données avec des données de test
 */
router.get('/db/seed', async (req, res, next) => {
  try {
    // Nettoyer toutes les collections
    await Promise.all([
      User.deleteMany({}),
      Livre.deleteMany({}),
      Categorie.deleteMany({}),
      Auteur.deleteMany({}),
      Panier.deleteMany({})
    ]);

    // Données de test pour les auteurs
    const auteurs = await Auteur.insertMany([
      { nom: 'Christian Bobin', biographie: 'Écrivain et poète français, connu pour ses textes courts et lumineux.' },
      { nom: 'George R.R. Martin', biographie: 'Auteur américain de fantasy, célèbre pour sa série "Le Trône de fer".' },
      { nom: 'J.R.R. Tolkien', biographie: 'Écrivain, poète et philologue britannique, créateur de la Terre du Milieu.' },
      { nom: 'Isaac Asimov', biographie: 'Écrivain et biochimiste américain, l\'un des maîtres de la science-fiction.' },
      { nom: 'Frank Herbert', biographie: 'Auteur américain de science-fiction, surtout connu pour son roman "Dune".' },
      { nom: 'Agatha Christie', biographie: 'Femme de lettres britannique, auteur de nombreux romans policiers.' },
      { nom: 'Stephen King', biographie: 'Écrivain américain de romans d\'horreur, de fantastique et de science-fiction.' },
      { nom: 'Edward Snowden', biographie: 'Edward Snowden, né le 21 juin 1983 à Elizabeth City, est un informaticien et lanceur d\'alerte américain' },
      { nom: 'George Orwell', biographie: 'Écrivain et journaliste britannique, auteur de "1984" et "La Ferme des animaux".' },
      { nom: 'Rene Goscinny', biographie: 'Scénariste français, créateur d\'Astérix et Lucky Luke avec ses dessinateurs.' },
      { nom: 'Albert Uderzo', biographie: 'Dessinateur et scénariste français, co-créateur d\'Astérix avec René Goscinny.' }
    ]);

    const categoriesParentes = await Categorie.insertMany([
      { nom: 'Imaginaire' },
      { nom: 'Policier & Thriller' },
      { nom: 'Littérature' },
      { nom: 'Non-Fiction' }
    ]);

    const imaginaire = categoriesParentes.find(c => c.nom === 'Imaginaire');
    const policier = categoriesParentes.find(c => c.nom === 'Policier & Thriller');
    const litterature = categoriesParentes.find(c => c.nom === 'Littérature');
    const nonFiction = categoriesParentes.find(c => c.nom === 'Non-Fiction');

    // Sous-catégories
    const sousCategories = await Categorie.insertMany([
      { nom: 'Fantasy', parent: imaginaire._id },
      { nom: 'Science-Fiction', parent: imaginaire._id },
      { nom: 'Horreur', parent: imaginaire._id },
      { nom: 'Dystopie', parent: imaginaire._id },
      { nom: 'Mystère', parent: policier._id },
      { nom: 'Roman', parent: litterature._id },
      { nom: 'Biographie', parent: nonFiction._id },
      { nom: 'Histoire', parent: nonFiction._id },
      { nom: 'Bande Dessinée', parent: imaginaire._id }
    ]);

    const allCategories = [...categoriesParentes, ...sousCategories];
    const fantasy = sousCategories.find(c => c.nom === 'Fantasy');
    const scienceFiction = sousCategories.find(c => c.nom === 'Science-Fiction');
    const mystere = sousCategories.find(c => c.nom === 'Mystère');
    const horreur = sousCategories.find(c => c.nom === 'Horreur');
    const dystopie = sousCategories.find(c => c.nom === 'Dystopie');
    const roman = sousCategories.find(c => c.nom === 'Roman');
    const Biographie = sousCategories.find(c => c.nom === 'Biographie');
    const BandeDessinee = sousCategories.find(c => c.nom === 'Bande Dessinée');

    const livres = await Livre.insertMany([
      {
        titre: "L'inespérée",
        auteurs: [auteurs.find(a => a.nom === 'Christian Bobin')._id],
        categories: [roman._id],
        isbn: '9782070394555',
        prix: 7.20,
        quantite: 50,
        couverture: "https://pictures.abebooks.com/isbn/9782070394555-fr.jpg"
      },
      {
        titre: "Une petite robe de fête",
        auteurs: [auteurs.find(a => a.nom === 'Christian Bobin')._id],
        categories: [roman._id],
        isbn: '9782070387243',
        prix: 3,
        quantite: 15,
        couverture: "https://pictures.abebooks.com/isbn/9782070387243-fr.jpg"
      },
      {
        titre: 'Le Trône de fer, tome 1',
        auteurs: [auteurs.find(a => a.nom === 'George R.R. Martin')._id],
        categories: [fantasy._id],
        isbn: '9782290302866',
        prix: 3.99,
        quantite: 0,
        couverture: "https://pictures.abebooks.com/isbn/9782290302866-fr.jpg"
      },
      {
        titre: 'Le Seigneur des anneaux',
        auteurs: [auteurs.find(a => a.nom === 'J.R.R. Tolkien')._id],
        categories: [fantasy._id],
        isbn: '9782070515790',
        prix: 5.75,
        quantite: 120,
        couverture: "https://pictures.abebooks.com/isbn/9782070515790-fr.jpg"
      },
      {
        titre: 'Le Hobbit',
        auteurs: [auteurs.find(a => a.nom === 'J.R.R. Tolkien')._id],
        categories: [fantasy._id],
        isbn: '9782266341233',
        prix: 16.12,
        quantite: 2,
        couverture: "https://pictures.abebooks.com/isbn/9782266341233-fr.jpg"
      },
      {
        titre: 'Fondation',
        auteurs: [auteurs.find(a => a.nom === 'Isaac Asimov')._id],
        categories: [scienceFiction._id],
        isbn: '9782070360536',
        prix: 5.40,
        quantite: 100,
        couverture: "https://pictures.abebooks.com/inventory/md/md32307083483.jpg"
      },
      {
        titre: 'Dune',
        auteurs: [auteurs.find(a => a.nom === 'Frank Herbert')._id],
        categories: [scienceFiction._id],
        isbn: '9780441172719',
        prix: 5.54,
        quantite: 90,
        couverture: "https://pictures.abebooks.com/isbn/9780441172719-fr.jpg"
      },
      {
        titre: 'Le Crime de l\'Orient-Express',
        auteurs: [auteurs.find(a => a.nom === 'Agatha Christie')._id],
        categories: [mystere._id],
        isbn: '9780008268879',
        prix: 7.50,
        quantite: 200,
        couverture: "https://pictures.abebooks.com/inventory/md/md31953931473.jpg"
      },
      {
        titre: 'Ça',
        auteurs: [auteurs.find(a => a.nom === 'Stephen King')._id],
        categories: [horreur._id],
        isbn: '9782253151340',
        prix: 13.40,
        quantite: 70,
        couverture: "https://pictures.abebooks.com/isbn/9782253151340-fr.jpg"
      },
      {
        titre: '1984',
        auteurs: [auteurs.find(a => a.nom === 'George Orwell')._id],
        categories: [dystopie._id, scienceFiction._id],
        isbn: '9780008322069',
        prix: 8.50,
        quantite: 180,
        couverture: "https://pictures.abebooks.com/inventory/md/md32233285926.jpg"
      },
      {
        titre: 'Mémoires vives',
        auteurs: [auteurs.find(a => a.nom === 'Edward Snowden')._id],
        categories: [Biographie._id],
        isbn: '9782757886076',
        prix: 4.82,
        quantite: 4,
        couverture: "https://pictures.abebooks.com/isbn/9782757886076-fr.jpg"
      },
      {
        titre: 'Asterix Et Cleopatre',
        auteurs: [
          auteurs.find(a => a.nom === 'Rene Goscinny')._id,
          auteurs.find(a => a.nom === 'Albert Uderzo')._id
        ],
        categories: [BandeDessinee._id],
        isbn: '9782012101388',
        prix: 12.86,
        quantite: 41,
        couverture: "https://pictures.abebooks.com/isbn/9782012101388-fr.jpg"
      }
    ]);

    const users = await User.insertMany([
      {
        "_id": "6738de95c897f7c13a506d04",
        "username": "user1",
        "password": "$2a$10$yMgy/.9KHgDpBl3w2Q5hseu9g8Ij8SSjR4jvm3UFcp1iNrobwtcz6",
        "is_admin": false,
        "first_name": "user",
        "last_name": "name",
        "avatar": "https://robohash.org/user1?set=set4",
        "email": "user1@cegep.ca",
        "is_active": true,
      },
      {
        "_id": "6738de9cc897f7c13a506d06",
        "username": "user2",
        "password": "$2a$10$J8CHeIfyxONRM2Bo5wnUt.5rMrvpCVDkW71eXXKMyvlTRwg.NptMK",
        "is_admin": false,
        "first_name": "cegep",
        "last_name": "Garneau",
        "avatar": "https://robohash.org/user2?set=set4",
        "email": "user2@cegep.ca",
        "is_active": true,
      },
      {
        "_id": "6738dea3c897f7c13a506d08",
        "username": "user3",
        "password": "$2a$10$DY6u8Q2qJ9jmnkuGGMfj4ediu9hfs1qp8s.lJvU9BvKJSUDCvkvXC",
        "is_admin": false,
        "first_name": "user",
        "last_name": "name",
        "avatar": "https://robohash.org/user3?set=set4",
        "email": "user3@cegep.ca",
        "is_active": true,
      },
      {
        "_id": "6738debdc897f7c13a506d0e",
        "username": "admin",
        "password": "$2a$10$mGV2sgPZL97TzH/ceQfwkOUMJQL7ETAd5IBv2xDJx5sJJkfyH3/m6",
        "is_admin": true,
        "first_name": "user",
        "last_name": "name",
        "avatar": "https://robohash.org/admin?set=set4",
        "email": "admin@cegep.ca",
        "is_active": true,
      }
    ]);

    // Associer les livres aux auteurs
    for (const livre of livres) {
      for (const auteurId of livre.auteurs) {
        await Auteur.findByIdAndUpdate(auteurId, { $push: { livres: livre._id } });
      }
      if (livre.categories?.length) {
        await Categorie.updateMany(
          { _id: { $in: livre.categories } },
          { $addToSet: { livres: livre._id } }
        );
      }
    }

    const stats = {
      auteurs: auteurs.length,
      categories: allCategories.length,
      livres: livres.length,
      users: users.length,
      message: 'Base de données initialisée avec succès!'
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * Route pour obtenir les statistiques de la base de données
 */
router.get('/db/stats', async (req, res, next) => {
  try {
    const [
      nbAuteurs,
      nbCategories,
      nbLivres,
      nbUsers
    ] = await Promise.all([
      Auteur.countDocuments(),
      Categorie.countDocuments(),
      Livre.countDocuments(),
      User.countDocuments()
    ]);

    const stats = {
      auteurs: nbAuteurs,
      categories: nbCategories,
      livres: nbLivres,
      users: nbUsers
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;