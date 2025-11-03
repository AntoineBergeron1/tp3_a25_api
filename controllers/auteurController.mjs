import Auteur from '../models/auteur.mjs';
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

/**
 * @desc    Récupérer tous les auteurs
 * @route   GET /api/auteurs
 * @access  Public
 */
export async function getAllAuteurs(req, res, next) {
    const auteurs = await Auteur.find({});
    res.json(auteurs);
}

/**
 * @desc    Récupérer un auteur par son ID
 * @route   GET /api/auteurs/:id
 * @access  Public
 */
export async function getAuteurById(req, res, next) {
    const auteurId = req.params.id;
    validerObjectId(auteurId);

    const auteur = await Auteur.findById(auteurId);
    validerObjetExiste(auteur, 'Auteur non trouvé');

    res.json(auteur);
}

/**
 * @desc    Créer un nouvel auteur
 * @route   POST /api/auteurs
 * @access  Privé/Admin
 */
export async function createAuteur(req, res, next) {
    const { nom } = req.body;
    if (!nom) {
        throw new ErreurValidation('Le champ nom est requis.', 400);
    }

    const nouvelAuteur = new Auteur({ nom });
    const auteurCree = await nouvelAuteur.save();
    res.status(201).json(auteurCree);
}

/**
 * @desc    Mettre à jour un auteur
 * @route   PUT /api/auteurs/:id
 * @access  Privé/Admin
 */
export async function updateAuteur(req, res, next) {
    const auteurId = req.params.id;
    validerObjectId(auteurId);

    const auteur = await Auteur.findByIdAndUpdate(auteurId, req.body, {
        new: true,
        runValidators: true
    });

    validerObjetExiste(auteur, 'Auteur non trouvé pour la mise à jour');
    res.json(auteur);
}

/**
 * @desc    Supprimer un auteur
 * @route   DELETE /api/auteurs/:id
 * @access  Privé/Admin
 */
export async function deleteAuteur(req, res, next) {
    const auteurId = req.params.id;
    validerObjectId(auteurId);

    const auteur = await Auteur.findByIdAndDelete(auteurId);

    validerObjetExiste(auteur, 'Auteur non trouvé pour la suppression');
    res.status(204).send();
}
