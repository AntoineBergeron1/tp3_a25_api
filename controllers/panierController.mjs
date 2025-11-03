import Panier from '../models/panier.mjs';
import Livre from '../models/livre.mjs';
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

/**
 * @desc    Récupérer le panier de l'utilisateur
 * @route   GET /api/panier
 * @access  Privé
 */
export async function getPanier(req, res, next) {
    const panier = await Panier.findOne({ user: req.user._id }).populate('items.livre');
    if (!panier) {
        // Si l'utilisateur n'a pas de panier, on en crée un vide
        const nouveauPanier = await Panier.create({ user: req.user._id, items: [], total: 0 });
        return res.json(nouveauPanier);
    }
    res.json(panier);
}

/**
 * @desc    Ajouter ou mettre à jour un article dans le panier
 * @route   POST /api/panier
 * @access  Privé
 */
export async function ajouterItemAuPanier(req, res, next) {
    const { livreId, quantite } = req.body;
    if (quantite <= 0) {
        throw new ErreurValidation("La quantité doit être supérieure à zéro.", 400);
    }
    validerObjectId(livreId);

    const livre = await Livre.findById(livreId);
    validerObjetExiste(livre, 'Livre non trouvé');

    let panier = await Panier.findOne({ user: req.user._id });
    if (!panier) {
        panier = await Panier.create({ user: req.user._id, items: [], total: 0 });
    }

    const itemIndex = panier.items.findIndex(item => item.livre.toString() === livreId);
    let quantitePrecedente = 0;

    if (itemIndex > -1) {
        quantitePrecedente = panier.items[itemIndex].quantite;
    }

    const quantiteRequise = quantite - quantitePrecedente;

    if (livre.quantite < quantiteRequise) {
        throw new ErreurValidation(`Stock insuffisant. ${livre.quantite} exemplaires restants.`, 400);
    }

    // Mettre à jour le stock du livre
    livre.quantite -= quantiteRequise;
    await livre.save();

    if (itemIndex > -1) {
        panier.items[itemIndex].quantite = quantite;
    } else {
        panier.items.push({ livre: livreId, quantite });
    }

    await panier.recalculerTotal();
    // On re-popule pour avoir les infos à jour du livre (comme le stock)
    const panierPopule = await panier.populate('items.livre');
    res.json(panierPopule);
}

/**
 * @desc    Supprimer un article du panier
 * @route   DELETE /api/panier/items/:livreId
 * @access  Privé
 */
export async function supprimerItemDuPanier(req, res, next) {
    const { livreId } = req.params;
    validerObjectId(livreId);

    const panier = await Panier.findOne({ user: req.user._id });
    validerObjetExiste(panier, 'Panier non trouvé');

    const itemIndex = panier.items.findIndex(item => item.livre.toString() === livreId);
    if (itemIndex === -1) {
        throw new ErreurValidation("Article non trouvé dans le panier.", 404);
    }

    const item = panier.items[itemIndex];
    const livre = await Livre.findById(item.livre);
    if (livre) {
        livre.quantite += item.quantite; // Restituer le stock
        await livre.save();
    }

    panier.items.splice(itemIndex, 1); // Supprimer l'article du panier

    await panier.recalculerTotal();
    const panierPopule = await panier.populate('items.livre');
    res.json(panierPopule);
}

/**
 * @desc    Vider le panier
 * @route   DELETE /api/panier
 * @access  Privé
 */
export async function viderPanier(req, res, next) {
    const panier = await Panier.findOne({ user: req.user._id });
    validerObjetExiste(panier, 'Panier non trouvé');

    // Restituer le stock pour chaque article
    for (const item of panier.items) {
        const livre = await Livre.findById(item.livre);
        if (livre) {
            livre.quantite += item.quantite;
            await livre.save();
        }
    }

    panier.items = [];
    await panier.recalculerTotal(); // Le total sera 0

    res.json(panier);
}
