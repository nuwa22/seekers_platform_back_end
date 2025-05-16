import express from 'express';
import {
  getActiveForms,
  updateForm,
  publishForm,
  stopForm,
  deleteForm,
  submitForm,
  getResponseStatistics,
  getMyDraftForms,
  getMyForms,
  getFormById,
  getMyFormById,
  activateForm
} from '../controllers/formController.js';

const router = express.Router();

// Route to publish a form
router.post('/publish', publishForm);

// Route to get all active published forms excluding the user's own
router.get('/active', getActiveForms);

// Route to update a form before publishing
router.put('/update', updateForm);

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

router.get('/get-form/:formId', getFormById );

router.get('/my-forms/:id', getMyFormById);

router.post('/activate', activateForm);

export default router;
