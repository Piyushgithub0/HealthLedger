import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// All routes require admin auth
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
});

// GET /api/admin/dashboard — real-time aggregated stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalRecords = await MedicalRecord.countDocuments();
    const ongoingCases = await MedicalRecord.countDocuments({ status: "Ongoing" });
    const activePrescriptions = await Prescription.countDocuments({ status: "Active" });

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayNewCases = await MedicalRecord.countDocuments({ date: todayStr });

    // Disease distribution
    const diseaseDistribution = await MedicalRecord.aggregate([
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Cases by location
    const casesByLocation = await MedicalRecord.aggregate([
      { $match: { location: { $ne: "" } } },
      { $group: { _id: "$location", cases: { $sum: 1 } } },
      { $sort: { cases: -1 } },
      { $limit: 8 },
    ]);

    // Monthly trends (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const allRecords = await MedicalRecord.find().select("date status");
    const monthlyMap = {};
    for (const record of allRecords) {
      if (!record.date) continue;
      const parts = record.date.split("-");
      if (parts.length < 2) continue;
      const monthKey = `${parts[0]}-${parts[1]}`;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { cases: 0, recovered: 0 };
      monthlyMap[monthKey].cases++;
      if (record.status === "Recovered" || record.status === "Completed") {
        monthlyMap[monthKey].recovered++;
      }
    }

    const sortedMonths = Object.keys(monthlyMap).sort().slice(-6);
    const monthlyTrend = sortedMonths.map((key) => {
      const monthIndex = parseInt(key.split("-")[1], 10) - 1;
      return { month: monthNames[monthIndex], cases: monthlyMap[key].cases, recovered: monthlyMap[key].recovered };
    });

    const mostCommon = diseaseDistribution.length > 0 ? diseaseDistribution[0]._id : "N/A";

    // Recent alerts
    const recentAlerts = await MedicalRecord.find({ status: "Ongoing" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName location");

    res.json({
      stats: { totalPatients, totalDoctors, totalRecords, ongoingCases, activePrescriptions, todayNewCases, mostCommon },
      diseaseDistribution: diseaseDistribution.map((d, i) => ({
        name: d._id,
        value: d.count,
        color: ["#2ECC71", "#10B981", "#E74C3C", "#F39C12", "#9B59B6", "#95A5A6"][i] || "#95A5A6",
      })),
      casesByLocation: casesByLocation.map((c) => ({ location: c._id, cases: c.cases })),
      monthlyTrend,
      recentAlerts: recentAlerts.map((a) => ({
        _id: a._id,
        diagnosis: a.diagnosis,
        location: a.location || a.userId?.location || "Unknown",
        patientName: a.userId?.fullName || "Unknown",
        date: a.date,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/patients — list all patients AND doctors with search
router.get("/patients", async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: { $in: ["patient", "doctor"] } };
    if (search) {
      query = {
        role: { $in: ["patient", "doctor"] },
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    }
    const patients = await User.find(query).select("-password").sort({ createdAt: -1 });

    const patientsWithCounts = await Promise.all(
      patients.map(async (p) => {
        const recordCount = await MedicalRecord.countDocuments({ userId: p._id });
        const activePrescriptions = await Prescription.countDocuments({ userId: p._id, status: "Active" });
        const lastRecord = await MedicalRecord.findOne({ userId: p._id }).sort({ createdAt: -1 });
        return {
          _id: p._id,
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
          age: p.age,
          gender: p.gender,
          bloodType: p.bloodType,
          location: p.location,
          conditions: p.conditions,
          allergies: p.allergies,
          recordCount,
          activePrescriptions,
          lastDiagnosis: lastRecord?.diagnosis || "—",
          lastVisit: lastRecord?.date || "—",
          createdAt: p.createdAt,
        };
      })
    );

    res.json(patientsWithCounts);
  } catch (error) {
    console.error("Admin patients error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/monitoring — disease surveillance data
router.get("/monitoring", async (req, res) => {
  try {
    // Disease-location matrix
    const diseaseByLocation = await MedicalRecord.aggregate([
      { $match: { location: { $ne: "" } } },
      { $group: { _id: { disease: "$diagnosis", location: "$location" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await MedicalRecord.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Diseases by severity (ongoing = active, more = higher severity)
    const diseasesSeverity = await MedicalRecord.aggregate([
      { $group: { _id: "$diagnosis", total: { $sum: 1 }, ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } } } },
      { $addFields: { severityScore: { $round: [{ $multiply: [{ $divide: ["$ongoing", "$total"] }, 100] }, 1] } } },
      { $sort: { severityScore: -1 } },
      { $limit: 10 },
    ]);

    // Weekly new cases (last 4 weeks)
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      const count = await MedicalRecord.countDocuments({ date: { $gte: startStr, $lt: endStr } });
      weeks.push({ week: `W${4 - i}`, cases: count, start: startStr, end: endStr });
    }

    // Top affected locations
    const topLocations = await MedicalRecord.aggregate([
      { $match: { location: { $ne: "" } } },
      { $group: { _id: "$location", cases: { $sum: 1 }, ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } } } },
      { $sort: { cases: -1 } },
      { $limit: 10 },
    ]);

    // Active outbreaks (locations with > 2 ongoing cases for the same disease)
    const outbreaks = await MedicalRecord.aggregate([
      { $match: { status: "Ongoing", location: { $ne: "" } } },
      { $group: { _id: { disease: "$diagnosis", location: "$location" }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      diseaseByLocation,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s._id,
        count: s.count,
        color: { Ongoing: "#F39C12", Recovered: "#2ECC71", Completed: "#10B981", Normal: "#95A5A6" }[s._id] || "#95A5A6",
      })),
      diseasesSeverity: diseasesSeverity.map((d) => ({
        disease: d._id,
        total: d.total,
        ongoing: d.ongoing,
        severityScore: d.severityScore,
      })),
      weeklyTrend: weeks,
      topLocations: topLocations.map((l) => ({ location: l._id, cases: l.cases, ongoing: l.ongoing })),
      outbreaks: outbreaks.map((o) => ({ disease: o._id.disease, location: o._id.location, count: o.count })),
    });
  } catch (error) {
    console.error("Admin monitoring error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/reports — downloadable report data
router.get("/reports", async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalRecords = await MedicalRecord.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();

    // Disease summary
    const diseaseSummary = await MedicalRecord.aggregate([
      { $group: { _id: "$diagnosis", total: { $sum: 1 }, ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } }, recovered: { $sum: { $cond: [{ $in: ["$status", ["Recovered", "Completed"]] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // Location summary
    const locationSummary = await MedicalRecord.aggregate([
      { $match: { location: { $ne: "" } } },
      { $group: { _id: "$location", total: { $sum: 1 }, ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // Doctor activity
    const doctorActivity = await MedicalRecord.aggregate([
      { $group: { _id: "$doctor", cases: { $sum: 1 } } },
      { $sort: { cases: -1 } },
    ]);

    // Monthly records
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const records = await MedicalRecord.find().select("date status");
    const monthlyMap = {};
    for (const rec of records) {
      if (!rec.date) continue;
      const p = rec.date.split("-");
      if (p.length < 2) continue;
      const key = `${p[0]}-${p[1]}`;
      if (!monthlyMap[key]) monthlyMap[key] = { cases: 0, recovered: 0 };
      monthlyMap[key].cases++;
      if (rec.status === "Recovered" || rec.status === "Completed") monthlyMap[key].recovered++;
    }
    const monthlySummary = Object.keys(monthlyMap).sort().map((k) => {
      const mi = parseInt(k.split("-")[1], 10) - 1;
      return { month: `${monthNames[mi]} ${k.split("-")[0]}`, cases: monthlyMap[k].cases, recovered: monthlyMap[k].recovered };
    });

    // Prescription summary
    const prescriptionSummary = await Prescription.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.json({
      overview: { totalPatients, totalDoctors, totalRecords, totalPrescriptions },
      diseaseSummary: diseaseSummary.map((d) => ({ disease: d._id, total: d.total, ongoing: d.ongoing, recovered: d.recovered })),
      locationSummary: locationSummary.map((l) => ({ location: l._id, total: l.total, ongoing: l.ongoing })),
      doctorActivity: doctorActivity.map((d) => ({ doctor: d._id, cases: d.cases })),
      monthlySummary,
      prescriptionSummary: prescriptionSummary.map((p) => ({ name: p._id, count: p.count, active: p.active })),
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Doctor Management ───────────────────────────────────────────

// GET /api/admin/doctors — list all doctors
router.get("/doctors", async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: "doctor" };
    if (search) {
      query = {
        role: "doctor",
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { specialization: { $regex: search, $options: "i" } },
          { hospital: { $regex: search, $options: "i" } },
        ],
      };
    }
    const doctors = await User.find(query).select("-password").sort({ createdAt: -1 });
    const result = await Promise.all(
      doctors.map(async (d) => {
        const casesHandled = await MedicalRecord.countDocuments({ doctor: d.fullName });
        return {
          _id: d._id,
          fullName: d.fullName,
          email: d.email,
          phone: d.phone,
          gender: d.gender,
          specialization: d.specialization,
          hospital: d.hospital,
          experience: d.experience,
          about: d.about,
          location: d.location,
          casesHandled,
          createdAt: d.createdAt,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/doctors/:id — edit doctor details
router.put("/doctors/:id", async (req, res) => {
  try {
    const { fullName, email, phone, gender, specialization, hospital, experience, about, location } = req.body;
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (fullName) doctor.fullName = fullName;
    if (email) doctor.email = email;
    if (phone !== undefined) doctor.phone = phone;
    if (gender !== undefined) doctor.gender = gender;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (experience !== undefined) doctor.experience = experience;
    if (about !== undefined) doctor.about = about;
    if (location !== undefined) doctor.location = location;

    await doctor.save();
    res.json({ message: "Doctor updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/doctors/:id — remove a doctor
router.delete("/doctors/:id", async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
