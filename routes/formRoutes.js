import express from 'express';
import {
  createForm,
  getActiveForms,
  updateForm,
  publishForm,
  stopForm,
  deleteForm,
  submitForm,
  getResponseStatistics,
  getMyDraftForms,
  getMyForms
} from '../controllers/formController.js';

const router = express.Router();

// Route to create a form
router.post('/create', createForm);

// Route to get all active published forms excluding the user's own
router.get('/active', getActiveForms);

// Route to update a form before publishing
router.put('/update', updateForm);

// Route to publish a form
router.put('/publish', publishForm);

// Route to stop (unpublish) a form
router.put('/stop', stopForm);

// Route to delete a form
router.delete('/delete', deleteForm);

// Route to submit a form response
router.post('/submit', submitForm);

// Route to get response statistics for a form
router.get('/statistics/:formId', getResponseStatistics);

router.get("/my-drafts", getMyDraftForms);

router.get("/my-forms", getMyForms);

export default router;
