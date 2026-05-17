import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = './uploads/materiales';

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const FILE_EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];

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
  'application/zip'
];

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;

  if (FILE_EXTENSIONES_PERMITIDAS.includes(ext) && FILE_MIME_TYPES_PERMITIDOS.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Permitidos: ${FILE_EXTENSIONES_PERMITIDAS.join(', ')}`), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

export const uploadMaterial = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

export const UPLOAD_PATH = UPLOAD_DIR;

export { MAX_FILE_SIZE, FILE_EXTENSIONES_PERMITIDAS };