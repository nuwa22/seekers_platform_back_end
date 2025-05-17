import connection from "../db/db.js"; 
import dotenv from "dotenv"; 
dotenv.config();

class IODocument {
  // Create new IO Document
  static create(documentData, callback) {
    const {
      profile_photo,
      tags, // Array of tags
      title,
      description,
      pdf_file,
      owner_email,
      owner_name,
      io_owner_profile_picture
    } = documentData;
    
    const tagsJson = JSON.stringify(tags); // Convert to JSON string
    
    const query = `
      INSERT INTO io_documents 
      (profile_photo, tags, title, description, pdf_file, owner_email, owner_name, io_owner_profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      profile_photo,
      tagsJson,
      title,
      description,
      pdf_file,
      owner_email,
      owner_name,
      io_owner_profile_picture
    ];
    
    connection.query(query, values, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
  
  // Get all documents
  static getAll(callback) {
    connection.query("SELECT * FROM io_documents", (err, results) => {
      if (err) return callback(err);
      
      // Parse tags back to array
      const formattedResults = results.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : []
      }));
      
      callback(null, formattedResults);
    });
  }
  
  // Get all documents excluding those owned by a specific user
  static getAllExcludingUser(email, callback) {
    const query = "SELECT * FROM io_documents WHERE owner_email != ?";
    connection.query(query, [email], (err, results) => {
      if (err) return callback(err);
      
      const formattedResults = results.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : []
      }));
      
      callback(null, formattedResults);
    });
  }
  
  // Get document by ID
  static getById(id, callback) {
    connection.query("SELECT * FROM io_documents WHERE id = ?", [id], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, null);
      
      const doc = results[0];
      doc.tags = doc.tags ? JSON.parse(doc.tags) : [];
      
      callback(null, doc);
    });
  }
  
  // Delete document by ID
  static deleteById(id, callback) {
    connection.query("DELETE FROM io_documents WHERE id = ?", [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
  
  // Update document by ID
  static updateById(id, documentData, callback) {
    const {
      profile_photo,
      tags,
      title,
      description,
      pdf_file,
      owner_email,
      owner_name,
      io_owner_profile_picture
    } = documentData;
    
    const tagsJson = JSON.stringify(tags); // Convert array to JSON string
    
    const query = `
      UPDATE io_documents 
      SET profile_photo = ?, tags = ?, title = ?, description = ?, pdf_file = ?, owner_email = ?, owner_name = ?, io_owner_profile_picture = ?
      WHERE id = ?
    `;
    
    const values = [
      profile_photo,
      tagsJson,
      title,
      description,
      pdf_file,
      owner_email,
      owner_name,
      io_owner_profile_picture,
      id
    ];
    
    connection.query(query, values, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
  
  // Get documents by user email
  static getByUserEmail(email, callback) {
    connection.query("SELECT * FROM io_documents WHERE owner_email = ?", [email], (err, results) => {
      if (err) return callback(err);
      
      const formattedResults = results.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : []
      }));
      
      callback(null, formattedResults);
    });
  }

  // New method: Update owner information in all documents owned by a user
  static updateOwnerInfo(ownerEmail, updates, callback) {
    const { name, profilePicture } = updates;
    
    // Skip if no updates to make
    if (!name && !profilePicture) {
      return callback(null, { message: "No updates needed" });
    }
    
    // Build the update query dynamically
    let updateQuery = "UPDATE io_documents SET ";
    const updateValues = [];
    const updateFields = [];
    
    if (name) {
      updateFields.push("owner_name = ?");
      updateValues.push(name);
    }
    
    if (profilePicture) {
      updateFields.push("io_owner_profile_picture = ?");
      updateValues.push(profilePicture);
    }
    
    // Skip if no valid fields to update
    if (updateFields.length === 0) {
      return callback(null, { message: "No valid fields to update" });
    }
    
    updateQuery += updateFields.join(", ");
    updateQuery += " WHERE owner_email = ?";
    updateValues.push(ownerEmail);
    
    connection.query(updateQuery, updateValues, (err, results) => {
      if (err) return callback(err);
      callback(null, {
        message: `Updated owner info in ${results.affectedRows} documents`,
        affectedRows: results.affectedRows
      });
    });
  }

  // Promise-based version of updateOwnerInfo for use with async/await
  static updateOwnerInfoAsync(ownerEmail, updates) {
    return new Promise((resolve, reject) => {
      this.updateOwnerInfo(ownerEmail, updates, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

export default IODocument;