import connection from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class Form {
  constructor(title, description, questions, tags, expiryDate, formProfilePhoto, ownerEmail) {
    this.title = title;
    this.description = description;
    this.questions = questions; // Array of question objects
    this.tags = Array.isArray(tags) ? tags.slice(0, 5) : [];; // Max 5 tags
    this.expiryDate = expiryDate;
    this.formProfilePhoto = formProfilePhoto;
    this.ownerEmail = ownerEmail; 
  }

  async save() {
    const query = `
      INSERT INTO forms (title, description, questions, tags, expiry_date, form_profile_photo, owner_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      this.title,
      this.description,
      JSON.stringify(this.questions),
      JSON.stringify(this.tags),
      this.expiryDate,
      this.formProfilePhoto,
      this.ownerEmail, 
    ];

    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  static async getAllActiveForms() {
    // First, mark expired forms as draft
    await connection.promise().query(
      `UPDATE forms SET is_draft = 1 WHERE expiry_date < CURDATE() AND is_draft = 0`
    );
  
    // Then fetch only active, published forms
    const query = `
      SELECT * FROM forms 
      WHERE expiry_date >= CURDATE() 
      AND is_published = 1 
      AND is_draft = 0
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
  
}

export default Form;
