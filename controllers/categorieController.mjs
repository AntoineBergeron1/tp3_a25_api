import Categorie from '../models/categorie.mjs';
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/categories
 * @access  Public
 */
export async function getAllCategories(req, res, next) {
    const categories = await Categorie.find({});
    res.json(categories);
}

/**
 * @desc    Récupérer une catégorie par son ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export async function getCategorieById(req, res, next) {
    const categorieId = req.params.id;
    validerObjectId(categorieId);

    const categorie = await Categorie.findById(categorieId).populate('livres');
    validerObjetExiste(categorie, 'Catégorie non trouvée');

    res.json(categorie);
}

/**
 * @desc    Créer une nouvelle catégorie
 * @route   POST /api/categories
 * @access  Privé/Admin
 */
export async function createCategorie(req, res, next) {
    const { nom } = req.body;
    if (!nom) {
        throw new ErreurValidation('Le champ nom est requis.', 400);
    }

    const nouvelleCategorie = new Categorie({ nom });
    const categorieCreee = await nouvelleCategorie.save();
    res.status(201).json(categorieCreee);
}

/**
 * @desc    Mettre à jour une catégorie
 * @route   PUT /api/categories/:id
 * @access  Privé/Admin
 */
export async function updateCategorie(req, res, next) {
    const categorieId = req.params.id;
    validerObjectId(categorieId);

    const categorie = await Categorie.findByIdAndUpdate(categorieId, req.body, {
        new: true,
        runValidators: true
    });

    validerObjetExiste(categorie, 'Catégorie non trouvée pour la mise à jour');
    res.json(categorie);
}

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/categories/:id
 * @access  Privé/Admin
 */
export async function deleteCategorie(req, res, next) {
    const categorieId = req.params.id;
    validerObjectId(categorieId);

    const categorie = await Categorie.findByIdAndDelete(categorieId);

    validerObjetExiste(categorie, 'Catégorie non trouvée pour la suppression');
    res.status(204).send();
}
