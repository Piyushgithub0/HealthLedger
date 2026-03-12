import express from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// GET /api/patient/pdf/:userId — public endpoint, generates patient PDF
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const records = await MedicalRecord.find({ userId: user._id }).sort({ createdAt: -1 });
    const prescriptions = await Prescription.find({ userId: user._id }).sort({ createdAt: -1 });
    const patientId = `HL-${user._id.toString().slice(-8).toUpperCase()}`;

    // Generate QR code as data URL for embedding in PDF
    const qrUrl = `${req.protocol}://${req.get("host")}/api/patient/pdf/${user._id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 120, margin: 1 });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=HealthLedger_${patientId}.pdf`);
    doc.pipe(res);

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 100).fill("#16a34a");
    doc.fontSize(28).fillColor("#ffffff").font("Helvetica-Bold").text("HealthLedger", 50, 30);
    doc.fontSize(11).font("Helvetica").text("Smart Healthcare History & Disease Surveillance", 50, 62);

    // ── QR Code (top right) ──
    doc.image(qrBuffer, doc.page.width - 130, 12, { width: 76 });

    // ── Patient Info Section ──
    let y = 120;
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(16).text("Patient Information", 50, y);
    y += 28;

    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    const infoRows = [
      ["Full Name", user.fullName],
      ["Patient ID", patientId],
      ["Email", user.email],
      ["Phone", user.phone || "Not provided"],
      ["Date of Birth", user.dateOfBirth || "Not provided"],
      ["Gender", user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not provided"],
      ["Blood Type", user.bloodType || "Not provided"],
      ["Address", user.address || "Not provided"],
      ["Emergency Contact", user.emergencyContact || "Not provided"],
      ["Allergies", user.allergies && user.allergies.length > 0 ? user.allergies.join(", ") : "None"],
      ["Conditions", user.conditions && user.conditions.length > 0 ? user.conditions.join(", ") : "None"],
    ];

    for (const [label, value] of infoRows) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#6b7280").text(label, 50, y, { width: 140 });
      doc.font("Helvetica").fontSize(10).fillColor("#111827").text(String(value), 200, y);
      y += 20;
    }

    // ── Medical History Section ──
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text("Medical History", 50, y);
    y += 28;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    if (records.length === 0) {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("No medical records found.", 50, y);
      y += 20;
    } else {
      // Table header
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
      doc.text("Date", 50, y, { width: 80 });
      doc.text("Diagnosis", 140, y, { width: 160 });
      doc.text("Doctor", 310, y, { width: 130 });
      doc.text("Status", 450, y, { width: 80 });
      y += 18;
      doc.rect(50, y - 3, doc.page.width - 100, 1).fill("#f3f4f6");

      for (const record of records) {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.font("Helvetica").fontSize(9).fillColor("#111827");
        doc.text(record.date, 50, y, { width: 80 });
        doc.text(record.diagnosis, 140, y, { width: 160 });
        doc.text(record.doctor, 310, y, { width: 130 });
        doc.text(record.status, 450, y, { width: 80 });
        y += 18;
      }
    }

    // ── Prescriptions Section ──
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text("Prescriptions", 50, y);
    y += 28;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;

    if (prescriptions.length === 0) {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("No prescriptions found.", 50, y);
      y += 20;
    } else {
      // Table header
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
      doc.text("Medication", 50, y, { width: 140 });
      doc.text("Dosage", 200, y, { width: 100 });
      doc.text("Duration", 310, y, { width: 90 });
      doc.text("Status", 410, y, { width: 70 });
      doc.text("Prescribed By", 480, y, { width: 80 });
      y += 18;
      doc.rect(50, y - 3, doc.page.width - 100, 1).fill("#f3f4f6");

      for (const rx of prescriptions) {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.font("Helvetica").fontSize(9).fillColor("#111827");
        doc.text(rx.name, 50, y, { width: 140 });
        doc.text(rx.dosage, 200, y, { width: 100 });
        doc.text(rx.duration, 310, y, { width: 90 });
        doc.text(rx.status, 410, y, { width: 70 });
        doc.text(rx.prescribedBy || "—", 480, y, { width: 80 });
        y += 18;
      }
    }

    // ── Footer ──
    y += 30;
    if (y > 720) { doc.addPage(); y = 50; }
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
    y += 10;
    doc.font("Helvetica").fontSize(8).fillColor("#9ca3af")
      .text(`Generated on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} by HealthLedger`, 50, y);
    doc.text("This is a computer-generated document.", 50, y + 14);

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
});

export default router;
