"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});
const uploadImageToCloudinary = (buffer, folder = "events") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
            if (error || !result) {
                return reject(error || new Error("Image upload failed"));
            }
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
