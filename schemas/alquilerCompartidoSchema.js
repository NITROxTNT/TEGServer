import mongoose from "mongoose";

var alquilerCompartidoSchema = new mongoose.Schema({
    residencia_id: mongoose.Schema.Types.ObjectId,
    arrendatario_id: mongoose.Schema.Types.ObjectId,
    arrendador_id: mongoose.Schema.Types.ObjectId,
    alquilerInicio: Date,
    alquilerFin: Date,
    precioAcordado: Number,
    opinionArrendador: String
}
);

const alquilerCompartidoModel = mongoose.model("alquileresCompartidos", alquilerCompartidoSchema);


export default alquilerCompartidoModel;