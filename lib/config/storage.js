import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FILE_EXTENSIONES_PERMITIDAS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
  'zip',
];

const FILE_MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/x-zip-compressed',
  'application/zip-compressed',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;

  if (
    FILE_EXTENSIONES_PERMITIDAS.includes(ext) &&
    FILE_MIME_TYPES_PERMITIDOS.includes(mime)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de archivo no permitido. Permitidos: ${FILE_EXTENSIONES_PERMITIDAS.join(
          ', '
        )}`
      ),
      false
    );
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'materiales',
      public_id: isImage ? uuidv4() : `${uuidv4()}${ext}`,
      resource_type: isImage ? 'image' : 'raw',
    };
  },
});

export const uploadMaterial = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

export { cloudinary, MAX_FILE_SIZE, FILE_EXTENSIONES_PERMITIDAS };
