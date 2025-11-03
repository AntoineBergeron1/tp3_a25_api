import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import { ErreurValidation } from '../lib/validation.mjs';

/**
 * @desc Middleware pour protéger les routes en vérifiant le token JWT.
 */
export const protect = async (req, res, next) => {
    let token;

    // On vérifie si le token est dans l'en-tête et commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // On extrait le token
            token = req.headers.authorization.split(' ')[1];

            // On décode le token pour obtenir l'ID de l'utilisateur
            const decoded = jwt.verify(token, process.env.SECRET_JWT);

            // On cherche l'utilisateur dans la base de données sans son mot de passe
            // et on l'attache à l'objet req pour les prochains middlewares
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return next(new ErreurValidation("Utilisateur non trouvé, token invalide.", 401));
            }

            next(); // On passe au prochain middleware
        } catch (error) {
            console.error(error);
            return next(new ErreurValidation('Non autorisé, le token a échoué.', 401));
        }
    }

    if (!token) {
        return next(new ErreurValidation('Non autorisé, pas de token fourni.', 401));
    }
};

/**
 * @desc Middleware pour vérifier si l'utilisateur est un administrateur.
 *       Doit être utilisé APRÈS le middleware `protect`.
 */
export const admin = (req, res, next) => {
    if (req.user && req.user.is_admin) {
        next(); // L'utilisateur est un admin, on continue
    } else {
        next(new ErreurValidation("Accès refusé. Réservé aux administrateurs.", 403));
    }
};