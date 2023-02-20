console.clear();
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import apiRouter from "./routes/apiRouter.js";
import arrendadorRouter from "./routes/arrendadorRouter.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const expressApp = express();

expressApp.use(express.json());

expressApp.use(cors());

expressApp.use("/api", apiRouter);

const boostrap = async () => {
    
    await mongoose.connect(process.env.MONGODB_URL);
    
    expressApp.listen(PORT, () => {
        console.log("Servidor levantado en el puerto: " + PORT);
    });

}

boostrap();