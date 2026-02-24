const streamifier = require("streamifier");
const cloudinary = require("../lib/cloudinary");

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { uploadBufferToCloudinary };
