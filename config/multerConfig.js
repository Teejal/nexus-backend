import multer from 'multer';
import path from 'path';

// Configure where and how uploaded files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + original name (avoids overwriting files with the same name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Only allow certain file types (documents, images, PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|png|jpg|jpeg/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Sirf PDF, DOC, DOCX, PNG, JPG files allowed hain'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit per file
});

export default upload;