import mongoose from "mongoose";

var arrendatarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    telefono: String,
    telefono2: String,
    cedula: String,
    imagen: {secure_url: String, public_id: String},
    social: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String
    }
}
);

const arrendatarioModel = mongoose.model("Arrendatarios", arrendatarioSchema);

export default arrendatarioModel;