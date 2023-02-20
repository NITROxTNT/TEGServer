import express from "express";
import Residencias from "../classes/rdClass.js";

import cloudinary from "../utils/cloudinary.js";
import uploadFile from "../utils/multer.js";

import rdModel from "../schemas/rdSchema.js";

import mongoose from "mongoose";

const rdRouter = express.Router();

rdRouter.get("/rdCercanas/:longitud/:latitud/:radio", 
async (req, res) => {

    var rdEncontradas = await Residencias.consultar_rdCercanas(req.params.longitud, req.params.latitud, req.params.radio);
    
    if (req.query.tipoResidencia && req.query.tipoResidencia != "") {
        console.log(req.query);
        switch (req.query.tipoResidencia) {
            case "normal":
                rdEncontradas = Residencias.filtrar_rdEncontradas(req.query, rdEncontradas);
                break;
        
            case "compartida":
                rdEncontradas = Residencias.filtrar_rdCompartidas(req.query, rdEncontradas);
                break;
        }
    }

    res.send(rdEncontradas);
});


rdRouter.get("/:id", 
async (req, res) => {
    var rdDatos = await Residencias.get_rdDatos(req.params.id)
    res.send(rdDatos);
});

rdRouter.get("/arrendatariosPotenciales/:idResidencia", 
async (req, res) => {
    var potencialesArrendatarios = await Residencias.consultar_potencialesArrendatarios(req.params.idResidencia)
    res.send(potencialesArrendatarios);
});

rdRouter.post("/nuevaRd", uploadFile().fields([{name: "imgPrincipal", maxCount: 1}, {name: "imgSecundarias", maxCount: 3}]),
async (req, res) => {

    var nuevaRd = Residencias.crear_nuevaRd(JSON.parse(req.body.rdDatos), req.files);
    res.send(nuevaRd);

});

rdRouter.post("/actualizarRd", uploadFile().fields([{name: "imgPrincipal", maxCount: 1}, {name: "imgSecundaria_0", maxCount: 1}, {name: "imgSecundaria_1", maxCount: 1}, {name: "imgSecundaria_2", maxCount: 1}]),
async (req, res) => {

    var residenciaActualizada = Residencias.actualizarResidencia(JSON.parse(req.body.rdDatos), req.files);
    res.send(residenciaActualizada);

});

export default rdRouter;
