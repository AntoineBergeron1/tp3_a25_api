"use strict";

import express from "express";
import { connect as mongooseConnect } from "mongoose";
import dotenvFlow from "dotenv-flow";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import authRoutes from "./routes/auth.mjs";
import seedRoutes from "./routes/db.mjs";
import livreRoutes from "./routes/livres.mjs";
import auteurRoutes from "./routes/auteurs.mjs";
import categorieRoutes from "./routes/categories.mjs";
import userRoutes from "./routes/users.mjs";
import panierRoutes from "./routes/panier.mjs";

dotenvFlow.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(seedRoutes);
app.use("/auth", authRoutes);
app.use("/api/livres", livreRoutes);
app.use("/api/auteurs", auteurRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/panier", panierRoutes);

// Gestionnaire d'erreurs (comme dans ton code)
app.use((error, _req, res, _next) => {
  console.log("Erreur:", error);
  if (error.code === 11000 && error.keyPattern) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    return res.status(409).json({
      message: `Une ressource avec ce ${field} existe déjà`,
      field,
      value,
    });
  }
  if (error.name === "CastError" && error.path === "_id") {
    return res
      .status(400)
      .json({ message: "ID invalide - doit être un ObjectId MongoDB valide" });
  }
  if (error.name === "ValidationError") {
    const errors = {};
    Object.keys(error.errors).forEach((field) => {
      errors[field] = error.errors[field].message;
    });
    return res.status(422).json({ message: "Erreurs de validation", errors });
  }
  const { message, data, statusCode } = error;
  res.status(statusCode ?? 500).json({ message, data });
});

// Gestionnaire de 404
app.use((_req, res, _next) => {
  res.status(404).json({ message: "Route ou ressource introuvable" });
});

// Connexion à MongoDB (à garder)
mongooseConnect(
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/etcaetera"
)
  .then(() => console.log("Connexion à MongoDB réussie"))
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB:", error);
    process.exit(1);
  });

export default app;
