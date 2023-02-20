import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";

import arrendatarioModel from  "../schemas/arrendatarioSchema.js";
import likedResidenciasModel from "../schemas/likedResidenciasSchema.js";
import rdModel from "../schemas/rdSchema.js";
import alquilerModel from "../schemas/alquilerSchema.js";
import alquilerCompartidoModel from "../schemas/alquilerCompartidoSchema.js";


export default class Arrendatario {

    static async iniciar_sesionArrendatario (email, password) {

        var arrendatarioData = await arrendatarioModel.findOne({
            email: email,
            password: password
        }, "_id nombre");

        return arrendatarioData;

    }

    static async consultar_arrendatarioData (arrendatario_id, arrendatario_cedula = null) {

        if (arrendatario_cedula) {
            var arrendatarioData = await arrendatarioModel.findOne({
                cedula: arrendatario_cedula
            }, {password: 0});

            return arrendatarioData;
        }

        var arrendatarioData = await arrendatarioModel.findOne({
            _id: mongoose.Types.ObjectId(arrendatario_id)
        }, {password: 0});

        return arrendatarioData;

    }

    static async consultar_arrendatarioPerfil (arrendatario_id) {

        var arrendatarioData = await arrendatarioModel.findOne({
            _id: mongoose.Types.ObjectId(arrendatario_id)
        }, {password: 0});

        var likedResidencias = await likedResidenciasModel.aggregate(
            [
                {
                    $match:{
                        arrendatario_id: mongoose.Types.ObjectId(arrendatario_id),
                    }
                },
                {
                    $lookup:{
                        from: "residencias",
                        localField: "residencia_id",
                        foreignField:"_id",
                        as: "likedResidencia"
                    }
                },
                {
                    $unwind: '$likedResidencia' 
                },
                {
                    $project: {
                        __v: 0,
                        arrendatario_id: 0,
                        residencia_id: 0                
                    }
                }
            ]
        );

        var arrendatario_Alquileres = {
            alquileresNormales: null,
            alquileresCompartidos: null
        };

        const consultaAlquileres = [
            {
                $match:{
                    arrendatario_id: mongoose.Types.ObjectId(arrendatario_id),
                }
            },
            {
                $lookup:{
                    from: "residencias",
                    localField: "residencia_id",
                    foreignField:"_id",
                    as: "residencia"
                }
            },
            {
                $unwind: '$residencia' 
            },
            {
                $lookup:{
                    from: "arrendadores",
                    localField: "arrendador_id",
                    foreignField:"_id",
                    as: "arrendador"
                }
            },
            {
                $unwind: '$arrendador' 
            },
            {
                $project:{
                    arrendador: {
                        password: 0
                    }
                }
            }
        ];

        arrendatario_Alquileres.alquileresNormales = await alquilerModel.aggregate(consultaAlquileres);

        arrendatario_Alquileres.alquileresCompartidos = await alquilerCompartidoModel.aggregate(consultaAlquileres);

        return {
            arrendatarioData: arrendatarioData,
            likedResidencias: likedResidencias,
            alquileres: arrendatario_Alquileres
        }

    }

    static async consultar_likedResidencia (idArrendatario, idResidencia ) {

        var likedResidencia = await likedResidenciasModel.findOne({
            residencia_id: mongoose.Types.ObjectId(idResidencia),
            arrendatario_id: mongoose.Types.ObjectId(idArrendatario)
        }, "residencia_id arrendatario_id");

        return likedResidencia;

    }

    static async meGustaResidencia (idArrendatario, idResidencia ) {

        var nuevoMeGusta = new likedResidenciasModel();

        Object.assign(nuevoMeGusta, {
            arrendatario_id: mongoose.Types.ObjectId(idArrendatario),
            residencia_id: mongoose.Types.ObjectId(idResidencia),
        })

        await nuevoMeGusta.save();

    }
    
    static async noMeGustaResidencia (idArrendatario, idResidencia ) {

        console.log(idArrendatario, idResidencia);

        await likedResidenciasModel.findOneAndDelete({
            arrendatario_id: mongoose.Types.ObjectId(idArrendatario),
            residencia_id: mongoose.Types.ObjectId(idResidencia),
        });

    }

    static async registrarArrendatario (data, imagen) {

        if(
            await arrendatarioModel.findOne({
            email: data.email
            }) != null
        ) {return 400;}

        if(
            await arrendatarioModel.findOne({
            cedula: data.cedula
            }) != null
        ) {return 401;}

        var nuevoArrendatario = new arrendatarioModel();

        try {
            let result = await cloudinary.uploader.upload(imagen.path);
            nuevoArrendatario.imagen = {secure_url: result.secure_url, public_id: result.public_id};
        } catch (error) {
            console.log(error);
        }

        Object.assign(nuevoArrendatario,
            
            {

                nombre: data.nombre,
                cedula: data.cedula,
                password: data.password,
                email: data.email,
                telefono: data.telefono,
                telefono2: data.telefono2,
                social: {
                    facebook: data.facebook,
                    instagram: data.instagram,
                    twitter: data.twitter,
                    linkedin: data.linkedin
                }

            }

            );

        await nuevoArrendatario.save();

    }

    static async editarArrendatario (data, imagen) {

        var arrendatarioOld = await arrendatarioModel.findOne({
            _id: data.idArrendatario
        });

        var arrendatarioNew = new arrendatarioModel();
        
        Object.assign(arrendatarioNew,
            
            {
                _id: arrendatarioOld._id,
                cedula: arrendatarioOld.cedula,
                nombre: data.nombre,
                password: arrendatarioOld.password,
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
                    await cloudinary.uploader.destroy(arrendatarioOld.imagen.public_id);
                } catch (error) {
                    console.log(error);
                }

                try {
                    let result = await cloudinary.uploader.upload(imagen.path);
                    arrendatarioNew.imagen = {secure_url: result.secure_url, public_id: result.public_id};
                } catch (error) {
                    console.log(error);
                }

            } else {
                arrendatarioNew.imagen = {secure_url: arrendatarioOld.imagen.secure_url, public_id: arrendatarioOld.imagen.public_id};
            }

            await arrendatarioModel.replaceOne({
                _id: mongoose.Types.ObjectId(arrendatarioOld._id)
            }, arrendatarioNew);

            return arrendatarioNew;

    }


}