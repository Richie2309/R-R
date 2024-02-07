const Multer = require('multer');
const path = require('path');
const storage = Multer.diskStorage({
    destination: (req, file, callBack) => {
        const assetsDir = path.join(__dirname,'../../../assets');
        const destinationPath = path.join(assetsDir,'uploads');
        callBack(null, destinationPath);
    },
    filename: (req, file, callBack) => {
        console.log(file);
          const extenction = file.originalname.substring(file.originalname.lastIndexOf('.'));
          callBack(null, `${file.originalname}-${Date.now()}${extenction}`);  
    }
});


exports.store = Multer({storage});