import arrendadorModel from  "../schemas/arrendadorSchema.js";
import alquilerCompartidoModel from "../schemas/alquilerCompartidoSchema.js";
import alquilerModel from "../schemas/alquilerSchema.js";
import Residencias from "./rdClass.js";
import rdModel from "../schemas/rdSchema.js";
import likedResidenciasModel from "../schemas/likedResidenciasSchema.js";
import Arrendatario from "./arrendatarioClass.js";
import cloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";


export default class Arrendador {

    static async iniciar_sesionArrendador (email, password) {

        var arrendadorData = await arrendadorModel.findOne({
            email: email,
            password: password
        }, "_id nombre");

        return arrendadorData;

    }

    static async desarrendarResidencia (idAlquiler, residencia_id) {

        console.log(residencia_id);

        var residenciaData = await Residencias.get_rdDatos(residencia_id);

        if(residenciaData[0].tipoResidencia == "normal") {

            if (
                await alquilerModel.updateOne({
                
                    _id: idAlquiler
                
                }, {$set: {alquilerFin: Date.now()}})
            )
             return true; 
                else return false;

        }

        else if (residenciaData[0].tipoResidencia == "compartida") {

            if (
                    await alquilerCompartidoModel.updateOne({
                    
                        _id: idAlquiler
                    
                    }, {$set: {alquilerFin: Date.now()}})
                )
                 return true; 
                    else return false;

        }

    }

    static async agregarOpinionArrendador (idAlquiler, opinionArrendador, residencia_id) {

        var residenciaData = await Residencias.get_rdDatos(residencia_id);

        if(residenciaData[0].tipoResidencia == "normal") {

           if (
                await alquilerModel.findByIdAndUpdate(idAlquiler, {opinionArrendador: opinionArrendador})
                ) 
                 return true;
                    else return false;
        }
        else if (residenciaData[0].tipoResidencia == "compartida") {

            if (
                await alquilerCompartidoModel.findByIdAndUpdate(idAlquiler, {opinionArrendador: opinionArrendador})
                )
                 return true; 
                    else return false;
        }

    }

    static async arrendarResidencia (residencia_id, arrendatario_id, consultarAlquiler = false) {

        var residenciaData = await Residencias.get_rdDatos(residencia_id);

        var aggregateConsulta = 
        [
            {
                $match:{
                    residencia_id: mongoose.Types.ObjectId(residencia_id),
                    alquilerFin: {$exists: false}
                }
            },
            {
                $lookup:{
                    from: "arrendatarios",
                    localField: "arrendatario_id",
                    foreignField:"_id",
                    as: "arrendatario"
                }
            },
            {
                $project: {
                    arrendatario: {
                        password: 0
                    }
                }
            }
        ]

        if(residenciaData[0].tipoResidencia == "compartida"){

        var listaAlquileres = await alquilerCompartidoModel.aggregate(aggregateConsulta);

        if(consultarAlquiler == true) return listaAlquileres;
            
            if (listaAlquileres.length > 0) {

                for (const alquiler of listaAlquileres) {
                        
                    if (alquiler.arrendatario_id == arrendatario_id){return;}
                }
                
            }
            
            var nuevoAlquiler = new alquilerCompartidoModel();
    
            Object.assign(nuevoAlquiler, {
                residencia_id: mongoose.Types.ObjectId(residencia_id),
                arrendador_id: mongoose.Types.ObjectId(residenciaData[0].id_arrendador),
                arrendatario_id: mongoose.Types.ObjectId(arrendatario_id),
                alquilerInicio: Date.now(),
                precioAcordado: residenciaData[0].precioMensual
            });
    
            await nuevoAlquiler.save();
    
            return nuevoAlquiler;

        }
        
        else if (residenciaData[0].tipoResidencia == "normal") {

            var alquilerData = await alquilerModel.aggregate(aggregateConsulta);
            
            if(consultarAlquiler == true) return alquilerData;
    
            if (alquilerData.length > 0) {
    
                if (alquilerData[0].arrendatario_id == arrendatario_id){return;}
                
                await alquilerModel.updateOne({
                
                    residencia_id: residencia_id,
                    alquilerFin: {$exists: false}
                    
                }, {$set: {alquilerFin: Date.now()}})
            }
    
            var nuevoAlquiler = new alquilerModel();
    
            Object.assign(nuevoAlquiler, {
                residencia_id: mongoose.Types.ObjectId(residencia_id),
                arrendador_id: mongoose.Types.ObjectId(residenciaData[0].id_arrendador),
                arrendatario_id: mongoose.Types.ObjectId(arrendatario_id),
                alquilerInicio: Date.now(),
                precioAcordado: residenciaData[0].precioMensual
            });
    
            await nuevoAlquiler.save();
    
            return nuevoAlquiler;
        }

    }

    static async consultar_arrendadorData (arrendador_id) {

        var arrendadorData = await arrendadorModel.findOne({
            _id: mongoose.Types.ObjectId(arrendador_id)
        }, {password: 0});


        var arrendadorResidencias = await rdModel.find ({
                id_arrendador: mongoose.Types.ObjectId(arrendador_id)
            }
        );

        var residenciasNormales = Array();
        var residenciasCompartidas = Array();

        for (const residencia of arrendadorResidencias) {
            if (residencia.tipoResidencia == "normal") residenciasNormales.push(residencia);
            if (residencia.tipoResidencia == "compartida") residenciasCompartidas.push(residencia);
        }

        return {

            arrendadorData: arrendadorData,
            residenciasNormales: residenciasNormales,
            residenciasCompartidas: residenciasCompartidas

        };

    }

    static async registrarArrendador (data, imagen) {

        if(
            await arrendadorModel.findOne({
            email: data.email
            }) != null
        ) {return 400;}

        var nuevoArrendador = new arrendadorModel();

        try {
            let result = await cloudinary.uploader.upload(imagen.path);
            nuevoArrendador.imagen = {secure_url: result.secure_url, public_id: result.public_id};
        } catch (error) {
            console.log(error);
        }

        Object.assign(nuevoArrendador,
            
            {

                nombre: data.nombre,
                password: data.password,
                email: data.email,
                telefono: data.telefono,
                telefono2: data.telefono2,
                perfilInmobiliario: data.inmobiliaria,
                social: {
                    facebook: data.facebook,
                    instagram: data.instagram,
                    twitter: data.twitter,
                    linkedin: data.linkedin
                }

            }

            );

        await nuevoArrendador.save();

    }

    static async editarArrendador (data, imagen) {

        var arrendadorOld = await arrendadorModel.findOne({
            _id: data.idArrendador
        });

        var arrendadorNew = new arrendadorModel();
        
        Object.assign(arrendadorNew,
            
            {
                _id: arrendadorOld._id,
                nombre: data.nombre,
                password: arrendadorOld.password,
                email: data.email,
                telefono: data.telefono,
                telefono2: data.telefono2,
                perfilInmobiliario: data.inmobiliaria,
                social: {
                    facebook: data.facebook,
                    instagram: data.instagram,
                    twitter: data.twitter,
                    linkedin: data.linkedin
                }

            }

            );

            if (imagen) {

                try {
                    await cloudinary.uploader.destroy(arrendadorOld.imagen.public_id);
                } catch (error) {
                    console.log(error);
                }

                try {
                    let result = await cloudinary.uploader.upload(imagen.path);
                    arrendadorNew.imagen = {secure_url: result.secure_url, public_id: result.public_id};
                } catch (error) {
                    console.log(error);
                }

            } else {
                arrendadorNew.imagen = {secure_url: arrendadorOld.imagen.secure_url, public_id: arrendadorOld.imagen.public_id};
            }

            await arrendadorModel.replaceOne({
                _id: mongoose.Types.ObjectId(arrendadorOld._id)
            }, arrendadorNew);

            return arrendadorNew;

    }

    static async eliminarResidencia (residencia_id) {

            var tipoResidencia = await rdModel.findOne({
                _id: mongoose.Types.ObjectId(residencia_id)
            }, {tipoResidencia: 1});

            tipoResidencia = tipoResidencia.tipoResidencia;

            if (tipoResidencia == "normal") {
                await alquilerModel.updateMany({
                    residencia_id: mongoose.Types.ObjectId(residencia_id),
                    alquilerFin: {$exists: false}
                }, {$set: {alquilerFin: Date.now()}});
            } 
            else 
                if (tipoResidencia == "compartida"){
                    await alquilerCompartidoModel.updateMany({
                        residencia_id: mongoose.Types.ObjectId(residencia_id),
                        alquilerFin: {$exists: false}
                    }, {$set: {alquilerFin: Date.now()}});
                }

            await likedResidenciasModel.deleteMany({
                residencia_id: mongoose.Types.ObjectId(residencia_id)
            });

           return (

            await rdModel.updateOne({
                _id: mongoose.Types.ObjectId(residencia_id)
            }, {$set: {disponibilidad: false}})
            
            );


    }

}