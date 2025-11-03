import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import { validerObjectId, validerObjetExiste, ErreurValidation } from '../lib/validation.mjs';

export async function login(req, res, next) {
  console.log('login')
  const email = req.body?.email?.toString()?.trim()?.toLowerCase() ?? "";
	const password = req.body?.password?.toString()?.trim() ?? "";

  try {
    const user = await User.findOne({ email }).select("+password");
    // Utilisation de la lib de validation
    validerObjetExiste(user, "Utilisateur non trouvé");

    // Vérifie si l'utilisateur est actif
    if (user && !user.is_active) {
      // Utilisation de l'erreur de validation personnalisée
      throw new ErreurValidation("Compte désactivé. Veuillez contacter l'administrateur.", 403);
    }

    if (!user) {
      throw new ErreurValidation("Utilisateur non trouvé", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Utilisation de l'erreur de validation personnalisée
      throw new ErreurValidation("Mot de passe incorrect", 401);
    }
    
    user.password = undefined;
    const token = jwt.sign({ id: user._id, is_admin: user.is_admin }, process.env.SECRET_JWT, { expiresIn: "48h" });
    res.json({token, user});
  } catch (error) {
    next(error);
  }
}

export async function signup(req, res, next) {
  const email = req.body?.email?.toString()?.trim()?.toLowerCase() ?? "";
	const password = req.body?.password?.toString()?.trim() ?? "";
  const { username, first_name, last_name } = req.body;
  
  try {
    if (password.length < 6) {
      throw new ErreurValidation("Le mot de passe doit contenir au moins 6 caractères", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      first_name,
      last_name,
      email
    });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    next(error);
  }
}


