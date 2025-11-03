import { isValidObjectId } from "mongoose";

/**
 * Vérifie si une chaîne de caractères donnée représente un ObjectId valide.
 *
 * @param {any} id identifiant à valider
 * @param {String?} msg message d'erreur à lancer en cas d'échec
 * @throws {Error} lorsque l'identifiant est invalide
 */
export function validerObjectId(id, msg = "Identifiant invalide!") {
	if (!isValidObjectId(id)) {
		const err = new Error(msg);
		err.statusCode = 422;
		throw err;
	}
}

/**
 * Valide l'expression donnée et lance une erreur si elle est fausse.
 * Assume qu'un vecteur vide est aussi une expression fausse.
 *
 * @param {any} expression Expression à valider
 * @param {String?} msg Message d'erreur à lancer en cas d'échec
 * @throws {ErreurObjetIntrouvable} en cas d'échec
 */
export function validerObjetExiste(expression, msg = "Objet introuvable!") {
	if (!expression || (Array.isArray(expression) && expression.length === 0)) {
		throw new ErreurObjetIntrouvable(msg);
	}
}

/**
 * Erreur de validation générique
 */
export class ErreurValidation extends Error {
	constructor(message, statusCode = 422) {
		super(message);
		this.statusCode = statusCode;
	}
}

/**
 * Erreur de validation pour un objet introuvable
 */
export class ErreurObjetIntrouvable extends Error {
	constructor(message, statusCode = 404) {
		super(message);
		this.statusCode = statusCode;
	}
}

/**
 * Permet de rediriger les erreurs vers le gestionnaire d'erreurs unique qui est
 * défini dans app.mjs.
 *
 * @param {MiddlewareExpress} middleware Middleware à envelopper pour rediriger les erreurs
 */
export function intercepterErreurs(middleware) {
	/**
	 * Middleware qui enveloppe le middleware original et redirige les erreurs
	 *
	 * @param {ExpressReq} req Requête
	 * @param {ExpressRes} res Réponse
	 * @param {ExpressNext} next Callback pour passer au prochain handler
	 */
	return async (req, res, next) => {
		try {
			await middleware(req, res, next);
		} catch (err) {
			next(err);
		}
	};
}
