import express from "express";
import Arrendador from "../classes/arrendadorClass.js";
import uploadFile from "../utils/multer.js";

const arrendadorRouter = express.Router();

arrendadorRouter.get("/:id", 
async (req, res) => {
    
    var arrendadorData = await Arrendador.consultar_arrendadorData(req.params.id);

    if(!arrendadorData) {res.sendStatus(404); return;}

    res.send(arrendadorData);

});

arrendadorRouter.post("/login", 
async (req, res) => {

    var datosSesion;

    datosSesion = await Arrendador.iniciar_sesionArrendador(req.body.email, req.body.password);

    if(!datosSesion) {res.sendStatus(401); return;}

    res.send(datosSesion);

});

arrendadorRouter.post("/arrendarResidencia", 
async (req, res) => {

    if(req.body.consultarAlquiler == true){
        res.send(await Arrendador.arrendarResidencia(req.body.residencia_id, req.body.arrendatario_id, true));    
        return;
    }

    await Arrendador.arrendarResidencia(req.body.residencia_id, req.body.arrendatario_id);
    res.send();
});

arrendadorRouter.post("/arrendarResidencia/agregarOpinionArrendador", 
async (req, res) => {

   res.send(await Arrendador.agregarOpinionArrendador(req.body.idAlquiler, req.body.opinionArrendador, req.body.residencia_id));

});

arrendadorRouter.post("/desarrendarResidencia", 
async (req, res) => {

   res.send(await Arrendador.desarrendarResidencia(req.body.idAlquiler, req.body.residencia_id));

});


arrendadorRouter.post("/registro", uploadFile().fields([{name: "imagen", maxCount: 1}]),
async (req, res) => {

    var operation = await Arrendador.registrarArrendador(JSON.parse(req.body.rdDatos), req.files.imagen[0]);

    if (operation == 400) res.sendStatus(operation);

    res.send();

});

arrendadorRouter.post("/editarUsuario", uploadFile().fields([{name: "imagen", maxCount: 1}]),
async (req, res) => {

    if (req.files.imagen) {await Arrendador.editarArrendador(JSON.parse(req.body.rdDatos), req.files.imagen[0])}
    else {await Arrendador.editarArrendador(JSON.parse(req.body.rdDatos), null)}

    res.send();

});

arrendadorRouter.post("/eliminarResidencia", 
async (req, res) => {

   console.log(req.body.residencia_id);

   res.send(await Arrendador.eliminarResidencia(req.body.residencia_id));

});

export default arrendadorRouter;