import { Router } from 'express';
import {
    getAllLivres,
    getLivreById,
    createLivre,
    updateLivre,
    deleteLivre,
    searchLivres
} from '../controllers/livreController.mjs';
import { intercepterErreurs } from "../lib/validation.mjs";

import { protect, admin } from '../middleware/authMiddleware.mjs';

const router = Router();

router.route('/')
    .get(intercepterErreurs(getAllLivres))
    .post(protect, admin, intercepterErreurs(createLivre)); 

router.route('/search')
    .get(intercepterErreurs(searchLivres));

router.route('/:id')
    .get(intercepterErreurs(getLivreById))
    .put(protect, admin, intercepterErreurs(updateLivre)) 
    .delete(protect, admin, intercepterErreurs(deleteLivre));


export default router;
