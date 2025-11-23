// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// // Configure Cloudinary with credentials from your .env file
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure multer-storage-cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "user-profile-pictures", // The name of the folder in your Cloudinary account
//     allowed_formats: ["jpg", "jpeg", "png"], // Allowed image formats
//     transformation: [{ width: 500, height: 500, crop: "limit" }], // Ensures images are a consistent size
//   },
// });

// // Create the multer instance with the configured storage
// const upload = multer({ storage: storage });

// module.exports = upload;
