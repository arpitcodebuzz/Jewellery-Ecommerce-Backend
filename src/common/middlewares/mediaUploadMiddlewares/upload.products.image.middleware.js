import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = 'public/uploads/products_images';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // ✅ 10 MB
  }
});
