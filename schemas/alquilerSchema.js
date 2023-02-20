import mongoose from "mongoose";

var alquilerSchema = new mongoose.Schema({
    residencia_id: mongoose.Schema.Types.ObjectId,
    arrendatario_id: mongoose.Schema.Types.ObjectId,
    arrendador_id: mongoose.Schema.Types.ObjectId,
    alquilerInicio: Date,
    alquilerFin: Date,
    precioAcordado: Number,
    opinionArrendador: String
}
);

const alquilerModel = mongoose.model("alquileres", alquilerSchema);

export default alquilerModel;