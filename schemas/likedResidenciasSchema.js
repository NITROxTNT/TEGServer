import mongoose from "mongoose";

var likedResidenciasSchema = new mongoose.Schema({
    residencia_id: mongoose.Schema.Types.ObjectId,
    arrendatario_id: mongoose.Schema.Types.ObjectId,
}
);

const likedResidenciasModel = mongoose.model("likedResidencias", likedResidenciasSchema);

export default likedResidenciasModel;