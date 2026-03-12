import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/patient/dashboard — aggregated stats
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    const totalVisits = await MedicalRecord.countDocuments({ userId });
    const activePrescriptions = await Prescription.countDocuments({ userId, status: "Active" });
    const recentRecords = await MedicalRecord.find({ userId }).sort({ createdAt: -1 }).limit(4);
    const recentPrescriptions = await Prescription.find({ userId, status: "Active" }).sort({ createdAt: -1 }).limit(3);
    const ongoingDiagnoses = await MedicalRecord.countDocuments({ userId, status: "Ongoing" });

    res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType || "N/A",
      },
      stats: {
        totalVisits,
        activePrescriptions,
        ongoingDiagnoses,
      },
      recentRecords,
      recentPrescriptions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/patient/profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/patient/profile
router.put("/profile", async (req, res) => {
  try {
    const allowedFields = [
      "fullName", "phone", "dateOfBirth", "gender",
      "bloodType", "address", "emergencyContact", "allergies", "conditions",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/patient/health-card
router.get("/health-card", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const totalVisits = await MedicalRecord.countDocuments({ userId: req.user._id });

    res.json({
      name: user.fullName,
      id: `HL-${user._id.toString().slice(-8).toUpperCase()}`,
      email: user.email,
      phone: user.phone || "Not provided",
      dateOfBirth: user.dateOfBirth || "Not provided",
      gender: user.gender || "Not provided",
      bloodType: user.bloodType || "Not provided",
      allergies: user.allergies || [],
      conditions: user.conditions || [],
      emergencyContact: user.emergencyContact || "Not provided",
      totalVisits,
      memberSince: user.createdAt,
    });
  } catch (error) {
    console.error("Health card error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/patient/history
router.get("/history", async (req, res) => {
  try {
    const records = await MedicalRecord.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/patient/history
router.post("/history", async (req, res) => {
  try {
    const { date, diagnosis, doctor, status, notes } = req.body;
    const record = await MedicalRecord.create({
      userId: req.user._id,
      date,
      diagnosis,
      doctor,
      status,
      notes,
    });
    res.status(201).json(record);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Add history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/patient/prescriptions
router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error("Prescriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/patient/prescriptions
router.post("/prescriptions", async (req, res) => {
  try {
    const { name, dosage, duration, status, prescribedBy, prescribedDate } = req.body;
    const prescription = await Prescription.create({
      userId: req.user._id,
      name,
      dosage,
      duration,
      status,
      prescribedBy,
      prescribedDate,
    });
    res.status(201).json(prescription);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Add prescription error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
