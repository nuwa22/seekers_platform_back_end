import Admin from "../models/admin.js";
import connection from "../db/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const admin = new Admin(req.user.email); 
        const users = await admin.getAllUsers();

        res.status(200).json({
            status: "success",
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ status: "error", error: "Could not fetch users" });
    }
};



export const getAllForms = async (req, res) => {
    try {
        const admin = new Admin(req.user.email);  
        const forms = await admin.getAllForms();

        res.status(200).json({
            status: "success",
            forms,
        });
    } catch (error) {
        console.error("Get all forms error:", error);
        res.status(500).json({ status: "error", error: "Could not fetch forms" });
    }
};

export const getAllIoDocuments = async (req, res) => {
  try {
    const admin = new Admin(req.user.email);
    const documents = await admin.getAllIoDocuments();

    res.status(200).json({
      status: "success",
      documents,
    });
  } catch (error) {
    console.error("Get all IO documents error:", error);
    res.status(500).json({ status: "error", error: "Could not fetch IO documents" });
  }
};

