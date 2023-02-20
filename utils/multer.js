import multer from "multer";
import path from "path";

function uploadFile() {
    
        const upload = multer({
        storage: multer.diskStorage({}),
        fileFilter: (req, file, cb) => {
            let ext = path.extname(file.originalname);
            if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
                cb(new Error("Tipo de archivo no soportado"), false);
                return;
            }
            cb(null, true);
        }
    });

    return upload;

};

export default uploadFile;