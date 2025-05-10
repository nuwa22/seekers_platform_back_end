import connection from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cron from 'node-cron';

dotenv.config();

class Form {
  constructor(title, description, questions, tags, expiryDate, formProfilePhoto, ownerEmail, ownerName, ownerProfilePicture) {
    this.title = title;
    this.description = description;
    this.questions = questions; // Array of question objects
    this.tags = Array.isArray(tags) ? tags.slice(0, 5) : []; // Max 5 tags
    this.expiryDate = expiryDate;
    this.formProfilePhoto = formProfilePhoto;
    this.ownerEmail = ownerEmail;
    this.ownerName = ownerName;
    this.ownerProfilePicture = ownerProfilePicture; 
  }

  async save() {
    const query = `
      INSERT INTO forms (title, description, questions, tags, expiry_date, form_profile_photo, owner_email, owner_name, owner_profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)	
    `;
    const values = [
      this.title,
      this.description,
      JSON.stringify(this.questions),
      JSON.stringify(this.tags),
      this.expiryDate,
      this.formProfilePhoto,
      this.ownerEmail,
      this.ownerName,
      this.profilePicture
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

// Cron job to automatically update published forms to draft at midnight every day
cron.schedule('0 0 * * *', async () => {
  try {
    // Log to console before updating
    console.log('Cron job started: Checking forms to update publish status.');
    
    // Update all forms that have passed their expiry date and are still published
    const query = `
      UPDATE forms 
      SET is_published = 0, is_draft = 1 
      WHERE expiry_date < CURDATE() AND is_published = 1
    `;
    
    await connection.promise().query(query);
    
    // Log success message after update
    console.log('Forms published status updated to draft successfully.');
  } catch (error) {
    console.error('Error updating forms:', error);
  }
}); 


export default Form;
