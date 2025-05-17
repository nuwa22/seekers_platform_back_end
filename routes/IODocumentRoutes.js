import express from 'express';
import {deleteIoDocument, getIoDocumentById,
        getIoDocumentsExcludingUser,
        getUserIoDocuments,
        uploadIoDocument } from '../controllers/IODocumentController.js';
import { authenticateToken } from '../middleware/auth.js';

const ioDocumentRouter = express.Router();

// Route to upload a new IO Document (expects Supabase URLs for files)
ioDocumentRouter.post('/upload', authenticateToken, uploadIoDocument);
ioDocumentRouter.get('/all/exclude', authenticateToken, getIoDocumentsExcludingUser);
ioDocumentRouter.get('/my-documents', authenticateToken, getUserIoDocuments);
ioDocumentRouter.get('/:id', authenticateToken, getIoDocumentById);
ioDocumentRouter.delete('/:id', authenticateToken, deleteIoDocument);




export default ioDocumentRouter;
