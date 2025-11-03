import { Schema, model } from 'mongoose';

const categorieSchema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Categorie',
      default: null, // Une catégorie parente est optionnelle (pour les catégories racines)
    },
    ordre: {
      type: Number,
      default: 0, // Pour définir un ordre d'affichage
    },
    livres: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'Livre'
      }],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pour s'assurer qu'il n'y a pas deux catégories avec le même nom sous le même parent.
// Une catégorie racine (parent: null) ne peut pas avoir de doublon de nom.
categorieSchema.index({ nom: 1, parent: 1 }, { unique: true });

export default model('Categorie', categorieSchema);
