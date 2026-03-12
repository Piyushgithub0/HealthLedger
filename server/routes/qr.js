import express from "express";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";
import QRSnapshot from "../models/QRSnapshot.js";

const router = express.Router();

// POST /api/qr/generate — create a new QR snapshot (patient generates new QR)
router.post("/generate", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const records = await MedicalRecord.find({ userId }).sort({ createdAt: -1 });
    const prescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 });

    // Count existing snapshots for version number
    const existingCount = await QRSnapshot.countDocuments({ userId });
    const version = existingCount + 1;
    const snapshotId = crypto.randomBytes(8).toString("hex");

    const snapshot = await QRSnapshot.create({
      userId,
      snapshotId,
      version,
      patientData: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        bloodType: user.bloodType || "",
        address: user.address || "",
        emergencyContact: user.emergencyContact || "",
        allergies: user.allergies || [],
        conditions: user.conditions || [],
      },
      medicalRecords: records.map((r) => ({
        date: r.date,
        diagnosis: r.diagnosis,
        doctor: r.doctor,
        status: r.status,
        notes: r.notes || "",
      })),
      prescriptions: prescriptions.map((p) => ({
        name: p.name,
        dosage: p.dosage,
        duration: p.duration,
        status: p.status,
        prescribedBy: p.prescribedBy || "",
      })),
    });

    res.json({
      snapshotId: snapshot.snapshotId,
      version: snapshot.version,
      createdAt: snapshot.createdAt,
    });
  } catch (error) {
    console.error("QR generate error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/qr/history — list all QR snapshots for the logged-in patient
router.get("/history", auth, async (req, res) => {
  try {
    const snapshots = await QRSnapshot.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("snapshotId version createdAt");
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/qr/history/:userId — doctor/admin can view any patient's QR history
router.get("/history/:userId", auth, async (req, res) => {
  try {
    const snapshots = await QRSnapshot.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select("snapshotId version createdAt");
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/qr/view/:snapshotId — public, returns snapshot JSON data (for scanning)
router.get("/view/:snapshotId", async (req, res) => {
  try {
    const snapshot = await QRSnapshot.findOne({ snapshotId: req.params.snapshotId });
    if (!snapshot) return res.status(404).json({ message: "QR code not found or expired" });

    res.json({
      version: snapshot.version,
      generatedAt: snapshot.createdAt,
      patient: snapshot.patientData,
      medicalRecords: snapshot.medicalRecords,
      prescriptions: snapshot.prescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/qr/pdf/:snapshotId — public, generates PDF from frozen snapshot
router.get("/pdf/:snapshotId", async (req, res) => {
  try {
    const snapshot = await QRSnapshot.findOne({ snapshotId: req.params.snapshotId });
    if (!snapshot) return res.status(404).json({ message: "QR snapshot not found" });

    const p = snapshot.patientData;
    const patientId = `HL-${snapshot.userId.toString().slice(-8).toUpperCase()}`;

    // Generate QR that points to this snapshot's view URL
    const qrUrl = `${req.protocol}://${req.get("host")}/api/qr/view/${snapshot.snapshotId}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 120, margin: 1 });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=HealthLedger_${patientId}_v${snapshot.version}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill("#16a34a");
    doc.fontSize(28).fillColor("#ffffff").font("Helvetica-Bold").text("HealthLedger", 50, 30);
    doc.fontSize(11).font("Helvetica").text(`Health Card — Version ${snapshot.version}`, 50, 62);
    doc.image(qrBuffer, doc.page.width - 130, 12, { width: 76 });

    // Patient info
    let y = 120;
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(16).text("Patient Information", 50, y);
    y += 28;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    const infoRows = [
      ["Full Name", p.fullName], ["Patient ID", patientId], ["Email", p.email],
      ["Phone", p.phone || "N/A"], ["DOB", p.dateOfBirth || "N/A"],
      ["Gender", p.gender || "N/A"], ["Blood Type", p.bloodType || "N/A"],
      ["Address", p.address || "N/A"], ["Emergency", p.emergencyContact || "N/A"],
      ["Allergies", p.allergies?.length > 0 ? p.allergies.join(", ") : "None"],
      ["Conditions", p.conditions?.length > 0 ? p.conditions.join(", ") : "None"],
    ];

    for (const [label, value] of infoRows) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#6b7280").text(label, 50, y, { width: 140 });
      doc.font("Helvetica").fontSize(10).fillColor("#111827").text(String(value), 200, y);
      y += 20;
    }

    // Medical records
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text("Medical History", 50, y);
    y += 28;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    if (snapshot.medicalRecords.length === 0) {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("No records.", 50, y);
    } else {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
      doc.text("Date", 50, y, { width: 80 });
      doc.text("Diagnosis", 140, y, { width: 160 });
      doc.text("Doctor", 310, y, { width: 130 });
      doc.text("Status", 450, y, { width: 80 });
      y += 18;
      for (const r of snapshot.medicalRecords) {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.font("Helvetica").fontSize(9).fillColor("#111827");
        doc.text(r.date || "", 50, y, { width: 80 });
        doc.text(r.diagnosis || "", 140, y, { width: 160 });
        doc.text(r.doctor || "", 310, y, { width: 130 });
        doc.text(r.status || "", 450, y, { width: 80 });
        y += 18;
      }
    }

    // Prescriptions
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text("Prescriptions", 50, y);
    y += 28;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    if (snapshot.prescriptions.length === 0) {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("No prescriptions.", 50, y);
    } else {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
      doc.text("Medication", 50, y, { width: 140 });
      doc.text("Dosage", 200, y, { width: 100 });
      doc.text("Duration", 310, y, { width: 90 });
      doc.text("Status", 410, y, { width: 70 });
      y += 18;
      for (const rx of snapshot.prescriptions) {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.font("Helvetica").fontSize(9).fillColor("#111827");
        doc.text(rx.name || "", 50, y, { width: 140 });
        doc.text(rx.dosage || "", 200, y, { width: 100 });
        doc.text(rx.duration || "", 310, y, { width: 90 });
        doc.text(rx.status || "", 410, y, { width: 70 });
        y += 18;
      }
    }

    // Footer
    y += 30;
    if (y > 720) { doc.addPage(); y = 50; }
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;
    doc.font("Helvetica").fontSize(8).fillColor("#9ca3af")
      .text(`Version ${snapshot.version} — Snapshot taken: ${new Date(snapshot.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`, 50, y);
    doc.text("This is a frozen snapshot of the patient data at the time of QR generation.", 50, y + 14);

    doc.end();
  } catch (error) {
    console.error("Snapshot PDF error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
});

export default router;
