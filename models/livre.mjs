import { Schema, model } from 'mongoose';

const livreSchema = new Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    auteurs: [{
      type: Schema.Types.ObjectId,
      ref: 'Auteur',
      required: true
    }],
    categories: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'Categorie'
      }],
      default: []
    },
    isbn: {
      type: String,
      required: [true, "L'ISBN est requis"],
      unique: true,
      trim: true,
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif'],
    },
    quantite: {
      type: Number,
      default: 0,
      min: [0, 'La quantité doit être positive ou nulle'],
    },
    couverture: {
      // URL vers l'image de couverture
      type: String,
      trim: true,
    },
    date_publication: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index utile pour les recherches par titre et auteur
livreSchema.index({ titre: 'text', auteur: 'text' });

export default model('Livre', livreSchema);