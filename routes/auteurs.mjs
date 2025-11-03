import { Router } from 'express';
import {
    getAllAuteurs,
    getAuteurById,
    createAuteur,
    updateAuteur,
    deleteAuteur
} from '../controllers/auteurController.mjs';
import { intercepterErreurs } from "../lib/validation.mjs";

import { protect, admin } from '../middleware/authMiddleware.mjs';

const router = Router();

router.route('/')
    .get(intercepterErreurs(getAllAuteurs))
    .post(protect, admin, intercepterErreurs(createAuteur)); 

router.route('/:id')
    .get(intercepterErreurs(getAuteurById))
    .put(protect, admin, intercepterErreurs(updateAuteur)) 
    .delete(protect, admin, intercepterErreurs(deleteAuteur));

export default router;
