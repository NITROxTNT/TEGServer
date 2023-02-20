import rdModel from "../schemas/rdSchema.js";
import likedResidenciasModel from "../schemas/likedResidenciasSchema.js";

import axios from "axios";
import { distance } from "@turf/turf";
import { point } from "@turf/helpers";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import uploadFile from "../utils/multer.js";


export default class Residencias {

    static async consultar_potencialesArrendatarios (residencia_id) {
        
        residencia_id = mongoose.Types.ObjectId(residencia_id);

        var potencialesArrendatarios = await likedResidenciasModel.aggregate(
            [
                {
                    $match:{
                        residencia_id: residencia_id
                    }
                },
                {
                    $lookup:{
                        from: "arrendatarios",
                        localField: "arrendatario_id",
                        foreignField:"_id",
                        as: "potencialArrendatario"
                    }
                },
                {
                    $project:{
                        arrendatario_id: 0,
                        residencia_id: 0,
                        __v: 0,
                        potencialArrendatario: {
                            password: 0
                        }

                    }
                }
            ]
        );

        return potencialesArrendatarios;

    }

     static async get_rdDatos(residencia_id) {
        
        residencia_id = mongoose.Types.ObjectId(residencia_id);

        var rdDatos = await rdModel.aggregate(
            [
                {
                    $match:{
                        _id: residencia_id
                    }
                },
                {
                    $lookup:{
                        from: "arrendadores",
                        localField: "id_arrendador",
                        foreignField:"_id",
                        as: "arrendador"
                    }
                },
                {
                    $project: {
                        arrendador: {
                            password: 0
                        }
                    }
                }
            ]
        );

        return rdDatos;
     }

     static async consultar_rdCercanas (longitud, latitud, radio) {

        const radioKm = radio / 6378.1;

       var rdEncontradas = await rdModel.find( { loc: { 
            $geoWithin: { 
                $centerSphere: [ [ longitud, latitud ] , radioKm ] 
            } 
        } 
    } );


    var rdRetorno = Array();
    var pOrigen = point([longitud, latitud]);

    for (let residencia of rdEncontradas) {
        
        let rdCopia = residencia.toObject();        

        let pResidencia = point(residencia.loc.coordinates);
        rdCopia.distanciaReferencia = distance(pOrigen, pResidencia);

    await axios
            .get(`https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${residencia.loc.coordinates[0]},${residencia.loc.coordinates[1]};${longitud},${latitud}?access_token=${process.env.MAPBOX_KEY}&annotations=distance&sources=0&destinations=1`)
            .then(res => {

                rdCopia.distanciaViajeReferencia = res.data.distances[0][0]/1000;

            })
            .catch(error => {
                console.log(error);
            });

            rdRetorno.push(rdCopia);
    };    

    return rdRetorno.sort(((a, b) => a.distanciaReferencia - b.distanciaReferencia));
    }

    static filtrar_rdEncontradas (queryParams, rdEncontradas) {
       
    return rdEncontradas.filter((residencia) => {

        if(queryParams.tipoResidencia != residencia.tipoResidencia) return false;
        if(queryParams.precioMensual && queryParams.precioMensual != "" ){if(residencia.precioMensual > queryParams.precioMensual) return false;}
        if(queryParams.cantidadHabitaciones && queryParams.cantidadHabitaciones != ""){if(residencia.cantidadHabitaciones < queryParams.cantidadHabitaciones) return false;}
        if(queryParams.cantidadBanos && queryParams.cantidadBanos != ""){if(residencia.cantidadBanos < queryParams.cantidadBanos) return false;}
        if(queryParams.metrajeTotal && queryParams.metrajeTotal != ""){if(residencia.metrajeTotal < queryParams.metrajeTotal) return false;}
        if(queryParams.metrajeEstacionamiento && queryParams.metrajeEstacionamiento != ""){if(residencia.metrajeEstacionamiento < queryParams.metrajeEstacionamiento) return false;}
        if(queryParams.metrajePatio && queryParams.metrajePatio != ""){if(residencia.metrajePatio < queryParams.metrajePatio) return false;}
        if(queryParams.amoblado && queryParams.amoblado != ""){if(residencia.amoblado != queryParams.amoblado) return false;}

        return true;
       })
       
    }

    static filtrar_rdCompartidas (queryParams, rdEncontradas) {
 
    return rdEncontradas.filter((residencia) => {

            if(queryParams.tipoResidencia != residencia.tipoResidencia) return false;
            if(queryParams.precioMensual && queryParams.precioMensual != ""){if(residencia.precioMensual > queryParams.precioMensual) return false;}
            if(queryParams.generoArrendatario && queryParams.generoArrendatario != ""){if(residencia.generoArrendatario != queryParams.generoArrendatario) return false;}
            if(queryParams.grupoArrendatario && queryParams.grupoArrendatario != ""){if(residencia.grupoArrendatario != queryParams.grupoArrendatario) return false;}
            if(queryParams.cocina && queryParams.cocina != ""){if(residencia.crtCompartidas.cocina != queryParams.cocina) return false;}
            if(queryParams.bano && queryParams.bano != ""){if(residencia.crtCompartidas.bano != queryParams.bano) return false;}
            if(queryParams.cuarto && queryParams.cuarto != ""){if(residencia.crtCompartidas.cuarto != queryParams.cuarto) return false;}
            if(queryParams.amoblado && queryParams.amoblado != ""){if(residencia.amoblado != queryParams.amoblado) return false;}

            return true;
           })

    }

    static async crear_nuevaRd (rdDatos, rdImagenes) {

        console.log(rdDatos);

        var nuevaRd = new rdModel();

        Object.assign(nuevaRd, 
    
            {
            
                tipoResidencia: rdDatos.tipoResidencia,
                id_arrendador: mongoose.Types.ObjectId(rdDatos.id_arrendador),
                loc: {
                    coordinates: [rdDatos._lngLat.lng, rdDatos._lngLat.lat],
                    type: "Point"
                },
                encabezado: rdDatos.encabezado,
                descripcion: rdDatos.descripcion,
                precioMensual: rdDatos.precioMensual,
                condicionesArrendamiento: rdDatos.condicionesArrendamiento,
                amoblado: rdDatos.amoblado
    
            }
    
        );
    
        if(rdDatos.tipoResidencia == "normal") {
    
            Object.assign(nuevaRd, 
    
                {
    
                    cantidadHabitaciones: rdDatos.cantidadHabitaciones,
                    cantidadBanos: rdDatos.cantidadBanos,
                    metrajeTotal: rdDatos.metrajeTotal,
                    metrajeEstacionamiento: rdDatos.metrajeEstacionamiento,
                    metrajePatio: rdDatos.metrajePatio
    
                }
                
            );
    
        } else 
        
        if(rdDatos.tipoResidencia == "compartida") {
    
            Object.assign(nuevaRd, 
    
                {
    
                    generoArrendatario: rdDatos.generoArrendatario,
                    grupoArrendatario: rdDatos.grupoArrendatario,
                    crtCompartidas: {
                        cocina: rdDatos.cocina,
                        cuarto: rdDatos.cuarto,
                        bano: rdDatos.bano,
                    }
    
                }
    
            );
    
        }
    
       try {
            let result = await cloudinary.uploader.upload(rdImagenes.imgPrincipal[0].path);
            nuevaRd.imagenes.principal = {secure_url: result.secure_url, public_id: result.public_id};
        } catch (error) {
            console.log(error);
        }
    
        for (const imgSecundaria of rdImagenes.imgSecundarias) {
            
            try {
                let result = await cloudinary.uploader.upload(imgSecundaria.path);
                nuevaRd.imagenes.secundarias.push({secure_url: result.secure_url, public_id: result.public_id});
            } catch (error) {
                console.log(error);
            }   
        
        };

        await nuevaRd.save();
 
    }

    static async actualizarResidencia (rdDatos, rdImagenes) {

        var nuevaRd = new rdModel();

        var rdActualmente = await Residencias.get_rdDatos(rdDatos.idResidencia);

        Object.assign(nuevaRd, 
    
            {
                _id: rdActualmente[0]._id,
                tipoResidencia: rdDatos.tipoResidencia,
                id_arrendador: mongoose.Types.ObjectId(rdActualmente[0].id_arrendador),
                loc: {
                    coordinates: [rdActualmente[0].loc.coordinates[0], rdActualmente[0].loc.coordinates[1]],
                    type: "Point"
                },
                encabezado: rdDatos.encabezado,
                descripcion: rdDatos.descripcion,
                precioMensual: rdDatos.precioMensual,
                condicionesArrendamiento: rdDatos.condicionesArrendamiento,
                amoblado: rdDatos.amoblado
    
            }
    
        );
    
        if(rdDatos.tipoResidencia == "normal") {
    
            Object.assign(nuevaRd, 
    
                {
    
                    cantidadHabitaciones: rdDatos.cantidadHabitaciones,
                    cantidadBanos: rdDatos.cantidadBanos,
                    metrajeTotal: rdDatos.metrajeTotal,
                    metrajeEstacionamiento: rdDatos.metrajeEstacionamiento,
                    metrajePatio: rdDatos.metrajePatio
    
                }
                
            );
    
        } else 
        
        if(rdDatos.tipoResidencia == "compartida") {
    
            Object.assign(nuevaRd, 
    
                {
    
                    generoArrendatario: rdDatos.generoArrendatario,
                    grupoArrendatario: rdDatos.grupoArrendatario,
                    crtCompartidas: {
                        cocina: rdDatos.cocina,
                        cuarto: rdDatos.cuarto,
                        bano: rdDatos.bano,
                    }
    
                }
    
            );
    
        }
    
        if(rdImagenes.imgPrincipal){
            try {
                await cloudinary.uploader.destroy(rdActualmente[0].imagenes.principal.public_id);
                let result = await cloudinary.uploader.upload(rdImagenes.imgPrincipal[0].path);
                nuevaRd.imagenes.principal = {secure_url: result.secure_url, public_id: result.public_id};
            } catch (error) {
                console.log(error);
            }
        } else {
            nuevaRd.imagenes.principal = rdActualmente[0].imagenes.principal;
        }

        if(rdImagenes.imgSecundaria_0){
            
            try {
                await cloudinary.uploader.destroy(rdActualmente[0].imagenes.secundarias[0].public_id);
                let result = await cloudinary.uploader.upload(rdImagenes.imgSecundaria_0[0].path);
                nuevaRd.imagenes.secundarias[0] = {secure_url: result.secure_url, public_id: result.public_id};
            } catch (error) {
                console.log(error);
            }
        } else {
            nuevaRd.imagenes.secundarias[0] = rdActualmente[0].imagenes.secundarias[0];
        }

        if(rdImagenes.imgSecundaria_1){
            
            try {
                await cloudinary.uploader.destroy(rdActualmente[0].imagenes.secundarias[1].public_id);
                let result = await cloudinary.uploader.upload(rdImagenes.imgSecundaria_1[0].path);
                nuevaRd.imagenes.secundarias[1] = {secure_url: result.secure_url, public_id: result.public_id};
            } catch (error) {
                console.log(error);
            }
        } else {
            nuevaRd.imagenes.secundarias[1] = rdActualmente[0].imagenes.secundarias[1];
        }

        if(rdImagenes.imgSecundaria_2){
            
            try {
                await cloudinary.uploader.destroy(rdActualmente[0].imagenes.secundarias[2].public_id);
                let result = await cloudinary.uploader.upload(rdImagenes.imgSecundaria_2[0].path);
                nuevaRd.imagenes.secundarias[2] = {secure_url: result.secure_url, public_id: result.public_id};
            } catch (error) {
                console.log(error);
            }
        } else {
            nuevaRd.imagenes.secundarias[2] = rdActualmente[0].imagenes.secundarias[2];
        }
        
        await rdModel.replaceOne({
            _id: mongoose.Types.ObjectId(rdDatos.idResidencia)
        }, nuevaRd);
        
        return nuevaRd;

    }


}