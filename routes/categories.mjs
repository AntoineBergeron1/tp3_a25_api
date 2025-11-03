import { Router } from 'express';
import {
    getAllCategories,
    getCategorieById,
    createCategorie,
    updateCategorie,
    deleteCategorie
} from '../controllers/categorieController.mjs';
import { intercepterErreurs } from "../lib/validation.mjs";

import { protect, admin } from '../middleware/authMiddleware.mjs';

const router = Router();

router.route('/')
    .get(intercepterErreurs(getAllCategories))
    .post(protect, admin, intercepterErreurs(createCategorie)); 

router.route('/:id')
    .get(intercepterErreurs(getCategorieById))
    .put(protect, admin, intercepterErreurs(updateCategorie)) 
    .delete(protect, admin, intercepterErreurs(deleteCategorie));

export default router;
