import User from '../models/user.mjs';
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/users
 * @access  Privé/Admin
 */
export async function getAllUsers(req, res, next) {
    const users = await User.find({}).select('-password');
    res.json(users);
}

/**
 * @desc    Récupérer un utilisateur par son ID
 * @route   GET /api/users/:id
 * @access  Privé/Admin
 */
export async function getUserById(req, res, next) {
    if (!req.user) {
        const userId = req.params.id;
    } else {
        // Si l'utilisateur est authentifié, récupérer son propre profil
        res.json(req.user);
    }

    validerObjectId(userId);

    const user = await User.findById(userId).select('-password');
    validerObjetExiste(user, 'Utilisateur non trouvé');

    res.json(user);
}

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Privé/Admin
 */
export async function updateUser(req, res, next) {
    const userId = req.params.id;
    validerObjectId(userId);

    // Empêcher la mise à jour du mot de passe via cette route
    if (req.body.password) {
        throw new ErreurValidation('La mise à jour du mot de passe n\'est pas autorisée via cette route.', 400);
    }

    const user = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    validerObjetExiste(user, 'Utilisateur non trouvé pour la mise à jour');
    res.json(user);
}

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Privé/Admin
 */
export async function deleteUser(req, res, next) {
    const userId = req.params.id;
    validerObjectId(userId);

    const user = await User.findByIdAndDelete(userId);

    validerObjetExiste(user, 'Utilisateur non trouvé pour la suppression');
    res.status(204).send();
}

/**
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @route   PUT /api/users/profile
 * @access  Privé
 */
export async function updateUserProfile(req, res, next) {
    const userId = req.user._id; // ID de l'utilisateur authentifié

    // Empêcher la mise à jour du mot de passe ou du rôle via cette route
    if (req.body.password || req.body.is_admin) {
        throw new ErreurValidation('La mise à jour du mot de passe ou du rôle n\'est pas autorisée.', 400);
    }

    const user = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    validerObjetExiste(user, 'Utilisateur non trouvé');
    res.json(user);
}

/**
 * @desc    Supprimer le profil de l'utilisateur connecté
 * @route   DELETE /api/users/profile
 * @access  Privé
 */
export async function deleteUserProfile(req, res, next) {
    const userId = req.user._id; // ID de l'utilisateur authentifié

    // Si admin, empêcher la suppression via cette route
    if (req.user.is_admin) {
        throw new ErreurValidation('Les administrateurs ne peuvent pas supprimer leur profil via cette route.', 400);
    }

    const user = await User.findByIdAndDelete(userId);

    validerObjetExiste(user, 'Utilisateur non trouvé pour la suppression');
    res.status(204).send();
}
