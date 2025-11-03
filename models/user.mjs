import { Schema, model } from "mongoose";

/**
 * Expression rationnelle pour valider les adresses courriel (RFC 6531)
 */
const regexCourriel = new RegExp(
	// eslint-disable-next-line no-useless-escape
	/^(?<localPart>(?<dotString>[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$/iu,
);

const userSchema = new Schema({
  username: { 
    type: String, 
    unique: true, 
    required: [true, "Le champ `pseudo` est requis"], 
    minLength: [1, "Le `pseudo` doit contenir au moins 1 caractère"],
    maxLength: [50, "Le `pseudo` ne peut pas dépasser 50 caractères"],
    trim: true
  },

  password: { 
    type: String, 
    required: [true, "Le champ `mot de passe` est requis"],
    minlength: [32, "Le champ `password` doit être un mot de passe haché de 32 à 255 caractères"],
		maxLength: [255, "Le champ `password` doit être un mot de passe haché de 32 à 255 caractères"],
    select: false
  },
  is_admin: { 
    type: Boolean, 
    required: [true, "Le champ `is_admin` est requis"],
    default: false
  },

  first_name: { 
    type: String, 
    required: false,
    minLength: [1, "Le `prénom` doit contenir au moins 1 caractère"],
    maxLength: [50, "Le `prénom` ne peut pas dépasser 50 caractères"],
    trim: true 
  },

  last_name: { 
    type: String, 
    required: false,
    minLength: [1, "Le `nom` doit contenir au moins 1 caractère"],
    maxLength: [50, "Le `nom` ne peut pas dépasser 50 caractères"],
    trim: true 
  },

  avatar: { 
    type: String,
    default: null
  },

  email: { 
    type: String, 
    required: [true, "Le champ `courriel` est requis"], 
    unique: true, 
    match: [regexCourriel, "L'adresse courriel n'est pas valide"]
  },

  is_active: { 
    type: Boolean, 
    required: [true, "Le champ `is_active` est requis"],
    default: true
  },

}, { timestamps: true });

userSchema.pre('save', async function(next) {
  this.avatar = `https://robohash.org/${this.username}?set=set4`;
  next();
});

userSchema.index({ last_name: 1, first_name: 1 });

export default model("User", userSchema);


