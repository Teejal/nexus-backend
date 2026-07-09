import mongoose from 'mongoose';

// Document schema - stores metadata about uploaded documents
const documentSchema = new mongoose.Schema(
  {
    // The user who uploaded this document
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Original file name (e.g. "pitch-deck.pdf")
    fileName: {
      type: String,
      required: true,
    },
    // Path where the file is stored on the server
    filePath: {
      type: String,
      required: true,
    },
    // File type/extension (e.g. "pdf", "docx")
    fileType: {
      type: String,
      required: true,
    },
    // File size in bytes
    fileSize: {
      type: Number,
      required: true,
    },
    // Version number - increases if the same document is re-uploaded
    version: {
      type: Number,
      default: 1,
    },
    // Status of the document (e.g. for e-signature tracking)
    status: {
      type: String,
      enum: ['uploaded', 'signed', 'pending_signature'],
      default: 'uploaded',
    },
    // Path to the e-signature image, if one has been attached
    signatureImagePath: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;