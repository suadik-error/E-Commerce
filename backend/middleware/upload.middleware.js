import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const adminRequestStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "admin_requests",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const uploadAdminDocs = multer({
  storage: adminRequestStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { uploadProfile };
export { uploadProduct };
export default uploadAdminDocs;
