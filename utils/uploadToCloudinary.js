const cloudinary = require("../config/cloudinaryConfig");
const sharp = require("sharp");

exports.uploadSingle = async (buffer, folder = "general", width = 800, height = 600) => {
  try {
    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: folder,
          format: "jpg",
          quality: "auto:good",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      ).end(processedBuffer);
    });
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

exports.uploadMultiple = async (buffers, folder = "general", width = 800, height = 600) => {
  try {
    const uploadPromises = buffers.map(buffer => this.uploadSingle(buffer, folder, width, height));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple images upload failed: ${error.message}`);
  }
};

exports.deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error deleting image from Cloudinary:", error.message);
    // Don't throw error - continue even if deletion fails
  }
};