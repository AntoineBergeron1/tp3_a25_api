import { Schema, model } from 'mongoose';

const itemPanierSchema = new Schema({
    livre: {
        type: Schema.Types.ObjectId,
        ref: 'Livre',
        required: true
    },
    quantite: {
        type: Number,
        required: true,
        min: [1, 'La quantité doit être au moins de 1.'],
        default: 1
    }
}, { _id: false }); // _id: false car ce sera un sous-document

const panierSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true // Chaque utilisateur a un seul panier
        },
        items: [itemPanierSchema],
        total: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Méthode pour recalculer le total du panier
panierSchema.methods.recalculerTotal = async function() {
    await this.populate('items.livre', 'prix');
    this.total = this.items.reduce((acc, item) => {
        if (item.livre) {
            return acc + (item.livre.prix * item.quantite);
        }
        return acc;
    }, 0);
    return this.save();
};


export default model('Panier', panierSchema);
