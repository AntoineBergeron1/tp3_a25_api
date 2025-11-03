import { Router } from 'express';
import {
    getPanier,
    ajouterItemAuPanier,
    supprimerItemDuPanier,
    viderPanier
} from '../controllers/panierController.mjs';
import { intercepterErreurs } from '../lib/validation.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = Router();

router.route('/')
    .get(protect, intercepterErreurs(getPanier))
    .post(protect, intercepterErreurs(ajouterItemAuPanier))
    .delete(protect, intercepterErreurs(viderPanier));

router.route('/items/:livreId')
    .delete(protect, intercepterErreurs(supprimerItemDuPanier));

export default router;
