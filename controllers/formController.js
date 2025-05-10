import Form from "../models/form.js";
import connection from "../db/db.js";
import jwt from "jsonwebtoken";
import { getUserFromToken } from "../middleware/auth.js";

// 1. Create a form
export const createForm = async (req, res) => {
  try {
    const { email: ownerEmail, name: ownerName, profilePicture: ownerProfilePicture } = getUserFromToken(req);
    const { title, description, questions, tags, expiryDate, formProfilePhoto } = req.body;

    const form = new Form(title, description, questions, tags, expiryDate, formProfilePhoto, ownerEmail, ownerName, ownerProfilePicture);
    const formId = await form.save();

    res.status(201).json({ message: "Form created", formId });
  } catch (err) {
    res.status(500).json({ message: "Error creating form", error: err.message });
  }
};

// 2. Get all active forms (excluding own)
export const getActiveForms = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);

    const [forms] = await connection.promise().query(
      `SELECT * FROM forms WHERE expiry_date >= CURDATE() AND owner_email != ? AND is_published = 1`,
      [userEmail]
    );

    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Update form (before publishing)
export const updateForm = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);
    const { formId, title, description, questions, tags, expiryDate, formProfilePhoto } = req.body;

    await connection.promise().query(
      `UPDATE forms SET title = ?, description = ?, questions = ?, tags = ?, expiry_date = ?, form_profile_photo = ?
       WHERE id = ? AND owner_email = ? AND is_published = 0`,
      [title, description, JSON.stringify(questions), JSON.stringify(tags), expiryDate, formProfilePhoto, formId, userEmail]
    );

    res.json({ message: "Form updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Publish form
export const publishForm = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);
    const { formId } = req.body;

    await connection.promise().query(
      `UPDATE forms SET is_published = 1, is_draft = 0 WHERE id = ? AND owner_email = ?`,
      [formId, userEmail]
    );

    res.json({ message: "Form published" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Stop form
export const stopForm = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);
    const { formId } = req.body;

    await connection.promise().query(
      `UPDATE forms SET is_published = 0, is_draft = 1 WHERE id = ? AND owner_email = ?`,
      [formId, userEmail]
    );

    res.json({ message: "Form stopped and saved as draft" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Delete form
export const deleteForm = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);
    const { formId } = req.body;

    await connection.promise().query(
      `DELETE FROM forms WHERE id = ? AND owner_email = ?`,
      [formId, userEmail]
    );

    res.json({ message: "Form deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Submit form response
export const submitForm = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);
    const { formId, answers } = req.body;

    const [formResult] = await connection.promise().query(`SELECT owner_email FROM forms WHERE id = ?`, [formId]);
    if (formResult.length === 0) return res.status(404).json({ error: "Form not found" });
    if (formResult[0].owner_email === userEmail) return res.status(403).json({ error: "Owners cannot submit their own forms" });

    await connection.promise().query(
      `INSERT INTO form_responses (form_id, user_email, answers) VALUES (?, ?, ?)`,
      [formId, userEmail, JSON.stringify(answers)]
    );

    await connection.promise().query(
      `UPDATE users SET point = point + 1 WHERE email = ?`,
      [userEmail]
    );

    res.json({ message: "Form submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Get response statistics
export const getResponseStatistics = async (req, res) => {
  try {
    const { formId } = req.params;

    const [formRows] = await connection.promise().query(`SELECT questions FROM forms WHERE id = ?`, [formId]);
    if (formRows.length === 0) return res.status(404).json({ error: "Form not found" });

    const questions = JSON.parse(formRows[0].questions);
    const [responses] = await connection.promise().query(`SELECT answers FROM form_responses WHERE form_id = ?`, [formId]);

    const totalResponses = responses.length;
    if (totalResponses === 0) return res.json({ message: "No responses yet" });

    const stats = {};

    responses.forEach(response => {
      const answers = JSON.parse(response.answers);
      questions.forEach((q, idx) => {
        const answer = answers[idx];
        if (!stats[q.label]) stats[q.label] = {};
        if (!stats[q.label][answer]) stats[q.label][answer] = 0;
        stats[q.label][answer]++;
      });
    });

    // Convert to percentage
    const percentageStats = {};
    Object.entries(stats).forEach(([question, answers]) => {
      percentageStats[question] = {};
      Object.entries(answers).forEach(([option, count]) => {
        percentageStats[question][option] = ((count / totalResponses) * 100).toFixed(2) + "%";
      });
    });

    res.json(percentageStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. Get user's draft forms
export const getMyDraftForms = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);

    const [drafts] = await connection.promise().query(
      `SELECT * FROM forms WHERE owner_email = ? AND is_draft = 1`,
      [userEmail]
    );

    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. Get all forms created by the user
export const getMyForms = async (req, res) => {
  try {
    const { email: userEmail } = getUserFromToken(req);

    const [forms] = await connection.promise().query(
      `SELECT * FROM forms WHERE owner_email = ?`,
      [userEmail]
    );

    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
