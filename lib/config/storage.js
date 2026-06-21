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
  params: (req, file) => ({
    folder: 'materiales',
    public_id: uuidv4(),
    resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
  }),
});

export const uploadMaterial = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

const AVATAR_EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

const AVATAR_MIME_TYPES_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;

const avatarFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;

  if (
    AVATAR_EXTENSIONES_PERMITIDAS.includes(ext) &&
    AVATAR_MIME_TYPES_PERMITIDOS.includes(mime)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Solo imágenes JPG, PNG, GIF, WebP.'
      ),
      false
    );
  }
};

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: (_req, _file) => ({
    folder: 'avatars',
    public_id: uuidv4(),
    resource_type: 'image',
  }),
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: AVATAR_MAX_FILE_SIZE,
  },
  fileFilter: avatarFileFilter,
});

export { cloudinary, MAX_FILE_SIZE, FILE_EXTENSIONES_PERMITIDAS };
