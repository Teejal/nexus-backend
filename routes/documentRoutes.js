import express from 'express';
import {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  signDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Upload a new document (uses multer middleware to handle the file)
router.post('/upload', protect, upload.single('document'), uploadDocument);

// Get all documents uploaded by the logged-in user
router.get('/', protect, getMyDocuments);

// Get a single document by ID
router.get('/:id', protect, getDocumentById);

// Attach an e-signature image to a document
router.put('/:id/sign', protect, upload.single('signature'), signDocument);

// Delete a document
router.delete('/:id', protect, deleteDocument);

export default router;