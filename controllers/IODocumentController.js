
import connection from "../db/db.js";
import IODocument from "../models/IODocument.js";
import { getUserFromToken } from "../middleware/auth.js";


export const uploadIoDocument = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      profile_photo,
      pdf_file,
      title,
      description,
      tags 
    } = req.body;

    if (!title || !description || !tags || !pdf_file || !profile_photo) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

    const newDocument = {
      profile_photo,
      tags: tagsArray,
      title,
      description,
      pdf_file,
      io_owner_profile_picture: user.profilePicture,
      owner_email: user.email,
      owner_name: user.name
    };

    IODocument.create(newDocument, (err, result) => {
      if (err) {
        console.error("Error saving IO document:", err);
        return res.status(500).json({ message: "Server error" });
      }

      return res.status(201).json({
        message: "IO Document uploaded successfully",
        documentId: result.insertId
      });
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export const getIoDocumentsExcludingUser = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    IODocument.getAllExcludingUser(user.email, (err, documents) => {
      if (err) {
        console.error("Error fetching documents:", err);
        return res.status(500).json({ message: "Server error" });
      }

      return res.status(200).json(documents);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export const deleteIoDocument = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const documentId = req.params.id;

    IODocument.getById(documentId, (err, doc) => {
      if (err) {
        console.error("Fetch error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (doc.owner_email !== user.email) {
        return res.status(403).json({ message: "You can only delete your own documents" });
      }

      IODocument.deleteById(documentId, (err, result) => {
        if (err) {
          console.error("Delete error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        return res.status(200).json({ message: "Document deleted successfully" });
      });
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export const getUserIoDocuments = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    IODocument.getByUserEmail(user.email, (err, documents) => {
      if (err) {
        console.error("Error fetching user's documents:", err);
        return res.status(500).json({ message: "Server error" });
      }

      return res.status(200).json(documents);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export const getIoDocumentById = async (req, res) => {
  try {
    const documentId = req.params.id;
    const user = getUserFromToken(req);
    
    // Check if user is authenticated
    if (!user || !user.email) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userEmail = user.email;
    
    IODocument.getById(documentId, async (err, doc) => {
      if (err) {
        console.error("Fetch error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      
   
      if (doc.owner_email !== userEmail) {
        try {
          const [result] = await connection.promise().query(
            `UPDATE users SET point = point - 1 WHERE email = ? AND point > 0`,
            [userEmail]
          );
          
          if (result.affectedRows === 0) {
            console.log(`No points deducted for user ${userEmail} - may have 0 points`);
          }
        } catch (pointErr) {
          console.error("Point deduction error:", pointErr);
  
        }
      }
      
      return res.status(200).json(doc);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Unexpected server error" });
  }
};