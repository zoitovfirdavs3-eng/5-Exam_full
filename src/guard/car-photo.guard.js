const app = require("converter-mb");
const path = require("path");
const { globalError, ClientError } = require("shokhijakhon-error-handler");
const { v4 } = require("uuid");

module.exports = (req, res, next) => {
    const allowedFormats = ['.png', '.jpg', '.jpeg'];
    const allowedFileSize = 5;
    try{
        if(!req.files) return next();
        let carImage = req.files?.car_image;
        let currentImageExt = path.extname(carImage.name);
        if(!allowedFormats.includes(currentImageExt)) throw new ClientError("Invalid image format", 415);
        const currentFileSize = app.byte(carImage.size);
        if(currentFileSize > allowedFileSize) throw new ClientError("Image size is too large. Maximum (5mb)", 413);
        req.filename = v4() + carImage.name;
        return next();
    }catch(err){
        return globalError(err, res);
    }
}