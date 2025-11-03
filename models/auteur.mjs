import { Schema, model } from 'mongoose';

const auteurSchema = new Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de l'auteur est requis"],
      trim: true,
      unique: true
    },
    biographie: {
      type: String,
      trim: true,
    },
    livres: [{
        type: Schema.Types.ObjectId,
        ref: 'Livre'
    }]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index pour la recherche par nom
auteurSchema.index({ nom: 'text' });

export default model('Auteur', auteurSchema);
