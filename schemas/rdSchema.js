import mongoose from "mongoose";

var rdSchema = new mongoose.Schema({
    
    //Atributos Comunes
    tipoResidencia: String,
    disponibilidad: Boolean,
    encabezado: String,
    descripcion: String,
    condicionesArrendamiento: [String],
    amoblado: Boolean,
    precioMensual: Number,
    id_arrendador: mongoose.Schema.Types.ObjectId,
    imagenes: {
        principal: {secure_url: String, public_id: String},
        secundarias: [{secure_url: String, public_id: String}]
    },
    loc     : {
        type : {type: String, default:"Point"},
        coordinates : [Number]
    },

    //Normales
    cantidadHabitaciones: Number,
    cantidadBanos: Number,
    metrajeTotal: Number,
    metrajeEstacionamiento: Number,
    metrajePatio: Number,
    
    //Compartidas
    generoArrendatario: String,
    grupoArrendatario: String,
    crtCompartidas: {
        cocina: Boolean,
        cuarto: Boolean,
        bano: Boolean
    }

}
);

const rdModel = mongoose.model("Residencia", rdSchema);

export default rdModel;
