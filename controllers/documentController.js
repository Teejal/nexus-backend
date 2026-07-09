import Document from '../models/Document.js';
import path from 'path';

// @route   POST /api/documents/upload
// @desc    Upload a new document
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Koi file upload nahi hui' });
    }

    const fileExtension = path.extname(req.file.originalname).replace('.', '');

    const document = await Document.create({
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: fileExtension,
      fileSize: req.file.size,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/documents
// @desc    Get all documents uploaded by the logged-in user
// @access  Private
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/documents/:id
// @desc    Get a single document's metadata by ID
// @access  Private
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document nahi mila' });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/documents/:id/sign
// @desc    Attach an e-signature image to a document
// @access  Private
export const signDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Signature image upload nahi hui' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document nahi mila' });
    }

    document.signatureImagePath = req.file.path;
    document.status = 'signed';
    await document.save();

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document nahi mila' });
    }

    // Only the person who uploaded it can delete it
    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Aap ye document delete nahi kar sakte' });
    }

    await document.deleteOne();
    res.status(200).json({ message: 'Document delete ho gaya' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};