import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserProfile,
    deleteUserProfile
} from '../controllers/userController.mjs';
import { intercepterErreurs } from '../lib/validation.mjs';
import { protect, admin } from '../middleware/authMiddleware.mjs';

const router = Router();

// Routes pour le profil de l'utilisateur connecté
router.route('/profile')
    .get(protect, intercepterErreurs(getUserById))
    .put(protect, intercepterErreurs(updateUserProfile))
    .delete(protect, intercepterErreurs(deleteUserProfile));

// Routes pour la gestion des utilisateurs (admin uniquement)
router.route('/')
    .get(protect, admin, intercepterErreurs(getAllUsers));

router.route('/:id')
    .get(protect, admin, intercepterErreurs(getUserById))
    .put(protect, admin, intercepterErreurs(updateUser))
    .delete(protect, admin, intercepterErreurs(deleteUser));

export default router;
