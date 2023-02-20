import express from "express";
import rdRouter from "./rdRouter.js";
import arrendadorRouter from "./arrendadorRouter.js";
import arrendatarioRouter from "./arrendatarioRouter.js";


const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
    res.send("Servidor de backend TEGProject, puerto: " + process.env.PORT);
});

apiRouter.use("/residencias", rdRouter);
apiRouter.use("/arrendador", arrendadorRouter);
apiRouter.use("/arrendatario", arrendatarioRouter);

export default apiRouter;