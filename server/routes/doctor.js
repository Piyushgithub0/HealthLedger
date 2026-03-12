import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// All routes require doctor auth
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== "doctor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Doctor access required" });
  }
  next();
});

// GET /api/doctor/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalRecords = await MedicalRecord.countDocuments();
    const ongoingCases = await MedicalRecord.countDocuments({ status: "Ongoing" });
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecords = await MedicalRecord.countDocuments({
      date: todayStr,
    });
    const recentRecords = await MedicalRecord.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email location");

    res.json({
      stats: {
        totalPatients,
        totalRecords,
        ongoingCases,
        todayRecords,
      },
      recentRecords: recentRecords.map((r) => ({
        _id: r._id,
        date: r.date,
        diagnosis: r.diagnosis,
        doctor: r.doctor,
        status: r.status,
        treatment: r.treatment,
        patientName: r.userId?.fullName || "Unknown",
        patientId: r.userId?._id,
      })),
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/doctor/patients
router.get("/patients", async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: "patient" };
    if (search) {
      query = {
        role: "patient",
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    }
    const patients = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Get record counts for each patient
    const patientsWithCounts = await Promise.all(
      patients.map(async (p) => {
        const recordCount = await MedicalRecord.countDocuments({ userId: p._id });
        const activePrescriptions = await Prescription.countDocuments({
          userId: p._id,
          status: "Active",
        });
        return {
          _id: p._id,
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
          age: p.age,
          gender: p.gender,
          bloodType: p.bloodType,
          location: p.location,
          recordCount,
          activePrescriptions,
          createdAt: p.createdAt,
        };
      })
    );

    res.json(patientsWithCounts);
  } catch (error) {
    console.error("Patients list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/doctor/patients/:id
router.get("/patients/:id", async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }
    const records = await MedicalRecord.find({ userId: patient._id }).sort({ createdAt: -1 });
    const prescriptions = await Prescription.find({ userId: patient._id }).sort({ createdAt: -1 });

    res.json({ patient, records, prescriptions });
  } catch (error) {
    console.error("Patient detail error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/doctor/patients/:id/records
router.post("/patients/:id/records", async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const { date, diagnosis, treatment, status, notes } = req.body;
    const record = await MedicalRecord.create({
      userId: patient._id,
      date: date || new Date().toISOString().slice(0, 10),
      diagnosis,
      doctor: req.user.fullName,
      treatment,
      status: status || "Ongoing",
      location: patient.location || "",
      notes,
    });
    res.status(201).json(record);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Add record error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/doctor/patients/:id/prescriptions
router.post("/patients/:id/prescriptions", async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const { name, dosage, duration, status, prescribedDate } = req.body;
    const prescription = await Prescription.create({
      userId: patient._id,
      name,
      dosage,
      duration,
      status: status || "Active",
      prescribedBy: req.user.fullName,
      prescribedDate: prescribedDate || new Date().toISOString().slice(0, 10),
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

// PUT /api/doctor/patients/:id/prescriptions/:rxId
router.put("/patients/:id/prescriptions/:rxId", async (req, res) => {
  try {
    const rx = await Prescription.findOne({ _id: req.params.rxId, userId: req.params.id });
    if (!rx) return res.status(404).json({ message: "Prescription not found" });

    const { name, dosage, duration, status, prescribedDate } = req.body;
    if (name !== undefined) rx.name = name;
    if (dosage !== undefined) rx.dosage = dosage;
    if (duration !== undefined) rx.duration = duration;
    if (status !== undefined) rx.status = status;
    if (prescribedDate !== undefined) rx.prescribedDate = prescribedDate;

    await rx.save();
    res.json(rx);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/doctor/patients/:id/prescriptions/:rxId
router.delete("/patients/:id/prescriptions/:rxId", async (req, res) => {
  try {
    const rx = await Prescription.findOneAndDelete({ _id: req.params.rxId, userId: req.params.id });
    if (!rx) return res.status(404).json({ message: "Prescription not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/doctor/profile
router.get("/profile", async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select("-password");
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/doctor/profile
router.put("/profile", async (req, res) => {
  try {
    const { fullName, phone, specialization, hospital, experience, about } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, specialization, hospital, experience, about },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

