import Livre from '../models/livre.mjs';
import Auteur from '../models/auteur.mjs';
import Categorie from '../models/categorie.mjs';
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

function toStringId(id) {
    return id.toString();
}

async function normaliserCategories(categories) {
    if (!Array.isArray(categories)) {
        throw new ErreurValidation('Le champ catégories doit être un tableau d\'identifiants.', 400);
    }

    if (categories.length === 0) {
        return [];
    }

    const ids = categories.map((categorieId) => {
        validerObjectId(categorieId, 'Identifiant de catégorie invalide');
        return toStringId(categorieId);
    });

    const uniques = [...new Set(ids)];

    const categoriesExistantes = await Categorie.find({ _id: { $in: uniques } }).select('_id');
    const existantesSet = new Set(categoriesExistantes.map((cat) => toStringId(cat._id)));

    const manquantes = uniques.filter((id) => !existantesSet.has(id));
    if (manquantes.length > 0) {
        throw new ErreurValidation(
            `Certaines catégories sont introuvables: ${manquantes.join(', ')}`,
            404
        );
    }

    return uniques;
}

async function ajouterLivreAuxCategories(livreId, categoriesIds) {
    if (Array.isArray(categoriesIds) && categoriesIds.length > 0) {
        await Categorie.updateMany(
            { _id: { $in: categoriesIds } },
            { $addToSet: { livres: livreId } }
        );
    }
}

async function retirerLivreDesCategories(livreId, categoriesIds) {
    if (Array.isArray(categoriesIds) && categoriesIds.length > 0) {
        await Categorie.updateMany(
            { _id: { $in: categoriesIds } },
            { $pull: { livres: livreId } }
        );
    }
}

/**
 * @desc    Récupérer tous les livres
 * @route   GET /api/livres
 * @access  Public
 */
export async function getAllLivres(req, res, next) {
    // Pagination basique via query params ?page=1&limit=10
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(parsedLimit || 10, 1), 4);
    const skip = (page - 1) * limit;

    const [total, livres] = await Promise.all([
        Livre.countDocuments({}),
        Livre.find({})
            .sort({ titre: 1 })
            .skip(skip)
            .limit(limit)
            .populate('auteurs', 'nom')
            .populate('categories', 'nom')
    ]);

    res.json({
        data: livres,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            count: livres.length
        }
    });
}

/**
 * @desc    Récupérer un livre par son ID
 * @route   GET /api/livres/:id
 * @access  Public
 */
export async function getLivreById(req, res, next) {
    const livreId = req.params.id;
    validerObjectId(livreId);

    const livre = await Livre.findById(livreId).populate('auteurs').populate('categories');
    validerObjetExiste(livre, 'Livre non trouvé');

    res.json(livre);
}

/**
 * @desc    Créer un nouveau livre
 * @route   POST /api/livres
 * @access  Privé/Admin
 */
export async function createLivre(req, res, next) {
    const { titre, auteurs, isbn } = req.body;
    if (!titre || !auteurs || !isbn || !Array.isArray(auteurs) || auteurs.length === 0) {
        throw new ErreurValidation('Les champs titre, isbn et au moins un auteur sont requis.', 400);
    }

    // Normaliser et valider les catégories si fournies
    const categoriesPayload = Object.prototype.hasOwnProperty.call(req.body, 'categories')
        ? req.body.categories
        : [];
    const categoriesNormalisees = await normaliserCategories(categoriesPayload);
    const nouveauLivre = new Livre({
        ...req.body,
        categories: categoriesNormalisees
    });

    const livreCree = await nouveauLivre.save();
    await ajouterLivreAuxCategories(livreCree._id, categoriesNormalisees);
    await livreCree.populate([
        { path: 'auteurs', select: 'nom' },
        { path: 'categories', select: 'nom' }
    ]);

    res.status(201).json(livreCree);
}

/**
 * @desc    Mettre à jour un livre
 * @route   PUT /api/livres/:id
 * @access  Privé/Admin
 */
export async function updateLivre(req, res, next) {
    const livreId = req.params.id;
    validerObjectId(livreId);

    const livreAvant = await Livre.findById(livreId);
    validerObjetExiste(livreAvant, 'Livre non trouvé pour la mise à jour');

    const updatePayload = { ...req.body };
    let categoriesNormalisees = null;
    if (Object.prototype.hasOwnProperty.call(req.body, 'categories')) {
        categoriesNormalisees = await normaliserCategories(req.body.categories);
        updatePayload.categories = categoriesNormalisees;
    }

    const livre = await Livre.findByIdAndUpdate(livreId, updatePayload, {
        new: true,
        runValidators: true
    });

    validerObjetExiste(livre, 'Livre non trouvé pour la mise à jour');
    if (!livre) {
        throw new ErreurValidation('Livre non trouvé pour la mise à jour', 404);
    }

    if (categoriesNormalisees !== null) {
        const categoriesAvant = (livreAvant.categories ?? []).map(toStringId);
        const categoriesApres = categoriesNormalisees;

        const avantSet = new Set(categoriesAvant);
        const apresSet = new Set(categoriesApres);

        const aAjouter = categoriesApres.filter((id) => !avantSet.has(id));
        const aRetirer = categoriesAvant.filter((id) => !apresSet.has(id));

        if (aAjouter.length > 0) {
            await ajouterLivreAuxCategories(livre._id, aAjouter);
        }
        if (aRetirer.length > 0) {
            await retirerLivreDesCategories(livre._id, aRetirer);
        }
    }

    await livre.populate([
        { path: 'auteurs', select: 'nom' },
        { path: 'categories', select: 'nom' }
    ]);

    res.json(livre);
}

/**
 * @desc    Supprimer un livre
 * @route   DELETE /api/livres/:id
 * @access  Privé/Admin
 */
export async function deleteLivre(req, res, next) {
    const livreId = req.params.id;
    validerObjectId(livreId);

    const livre = await Livre.findByIdAndDelete(livreId);

    validerObjetExiste(livre, 'Livre non trouvé pour la suppression');
    if (!livre) {
        throw new ErreurValidation('Livre non trouvé pour la suppression', 404);
    }
    const categoriesLiees = (livre.categories ?? []).map(toStringId);
    await retirerLivreDesCategories(livre._id, categoriesLiees);
    res.status(204).send(); // 204 No Content
}

/**
 * @desc    Recherche de livres par titre ou nom d'auteur
 * @route   GET /api/livres/search?q=mot
 * @access  Public
 */
export async function searchLivres(req, res, next) {
    const q = (req.query.q || '').toString().trim();
    if (!q) {
        throw new ErreurValidation("Le paramètre 'q' est requis pour la recherche.", 400);
    }

    // Recherche par titre (regex insensible à la casse) ou par nom d'auteur
    const auteursMatches = await Auteur.find({ nom: { $regex: q, $options: 'i' } }).select('_id');
    const auteurIds = auteursMatches.map(a => a._id);

    const filter = {
        $or: [
            { titre: { $regex: q, $options: 'i' } },
            { auteurs: { $in: auteurIds } }
        ]
    };

    const livres = await Livre.find(filter)
        .sort({ createdAt: -1 })
        .populate('auteurs', 'nom')
        .populate('categories', 'nom');

    res.json(livres);
}