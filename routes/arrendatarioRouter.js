import express from "express";
import Arrendatario from "../classes/arrendatarioClass.js";
import uploadFile from "../utils/multer.js";

const arrendatarioRouter = express.Router();

arrendatarioRouter.post("/login", 
async (req, res) => {

    var datosSesion;

    datosSesion = await Arrendatario.iniciar_sesionArrendatario(req.body.email, req.body.password);

    if(!datosSesion) {res.sendStatus(401); return;}

    res.send(datosSesion);

});

arrendatarioRouter.get("/likedResidencia/:idArrendatario/:idResidencia", 
async (req, res) => {
    var likedResidencia = await Arrendatario.consultar_likedResidencia(req.params.idArrendatario, req.params.idResidencia);
    res.send(likedResidencia);
});

arrendatarioRouter.post("/likedResidencia/meGusta", 
async (req, res) => {
    await Arrendatario.meGustaResidencia(req.body.idArrendatario, req.body.idResidencia);
    res.send();
});

arrendatarioRouter.delete("/likedResidencia/noMeGusta", 
async (req, res) => {
    await Arrendatario.noMeGustaResidencia(req.body.idArrendatario, req.body.idResidencia);
    res.send();
});

arrendatarioRouter.get("/:idArrendatario", 
async (req, res) => {
    var arrendatarioData = await Arrendatario.consultar_arrendatarioPerfil(req.params.idArrendatario);
    res.send(arrendatarioData);
});

arrendatarioRouter.get("/consultarCedula/:cedulaArrendatario", 
async (req, res) => {
    var arrendatarioData = await Arrendatario.consultar_arrendatarioData(null, req.params.cedulaArrendatario);
    res.send(arrendatarioData);
});

arrendatarioRouter.post("/registro", uploadFile().fields([{name: "imagen", maxCount: 1}]),
async (req, res) => {

    var operation = await Arrendatario.registrarArrendatario(JSON.parse(req.body.rdDatos), req.files.imagen[0]);

    if (operation == 400) res.sendStatus(operation);
    if (operation == 401) res.sendStatus(operation);

    res.send();

});

arrendatarioRouter.post("/editarUsuario", uploadFile().fields([{name: "imagen", maxCount: 1}]),
async (req, res) => {

    if (req.files.imagen) {await Arrendatario.editarArrendatario(JSON.parse(req.body.rdDatos), req.files.imagen[0])}
    else {await Arrendatario.editarArrendatario(JSON.parse(req.body.rdDatos), null)}

    res.send();

});

export default arrendatarioRouter;