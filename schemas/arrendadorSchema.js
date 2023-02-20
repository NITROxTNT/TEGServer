import mongoose from "mongoose";

var arrendadorSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    telefono: String,
    telefono2: String,
    perfilInmobiliario: String,
    imagen: {secure_url: String, public_id: String},
    social: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String
    }

}
);

const arrendadorModel = mongoose.model("Arrendadores", arrendadorSchema);

export default arrendadorModel;
