import express from "express";
import nodemailer from "nodemailer";
import auth from "../middleware/auth.js";
import MedicalRecord from "../models/MedicalRecord.js";
import mongoose from "mongoose";

const router = express.Router();

// Alert schema (stored in MongoDB)
const alertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["outbreak", "spike", "threshold"], required: true },
    severity: { type: String, enum: ["critical", "warning", "info"], default: "warning" },
    disease: { type: String, required: true },
    location: { type: String, default: "" },
    message: { type: String, required: true },
    caseCount: { type: Number, default: 0 },
    emailSent: { type: Boolean, default: false },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Alert = mongoose.models.Alert || mongoose.model("Alert", alertSchema);

// Create email transporter
function getTransporter() {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_APP_PASSWORD;
  if (!email || !password) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
}

// Send alert email
async function sendAlertEmail(alert) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("⚠️  Email not configured — skipping alert email");
    return false;
  }

  const recipient = process.env.ALERT_RECIPIENT || process.env.SMTP_EMAIL;
  const severityEmoji = { critical: "🔴", warning: "🟡", info: "🟢" };
  const emoji = severityEmoji[alert.severity] || "⚠️";

  try {
    await transporter.sendMail({
      from: `"HealthLedger Alerts" <${process.env.SMTP_EMAIL}>`,
      to: recipient,
      subject: `${emoji} HealthLedger Alert: ${alert.disease} — ${alert.type.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E5E5; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${alert.severity === "critical" ? "#E74C3C" : alert.severity === "warning" ? "#F39C12" : "#2ECC71"}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">${emoji} Disease Alert</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Severity:</td>
                <td style="padding: 8px 0; color: #555; text-transform: uppercase;">${alert.severity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Disease:</td>
                <td style="padding: 8px 0; color: #555;">${alert.disease}</td>
              </tr>
              ${alert.location ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Location:</td>
                <td style="padding: 8px 0; color: #555;">${alert.location}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Cases:</td>
                <td style="padding: 8px 0; color: #555;">${alert.caseCount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Alert Type:</td>
                <td style="padding: 8px 0; color: #555; text-transform: capitalize;">${alert.type}</td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background-color: #F9F9F9; border-radius: 8px;">
              <p style="margin: 0; color: #333;">${alert.message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              This is an automated alert from HealthLedger Disease Surveillance System.<br/>
              Generated at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Alert email sent: ${alert.disease} — ${alert.severity}`);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    return false;
  }
}

// POST /api/alerts/check — scan for outbreaks and generate alerts
router.post("/check", auth, async (req, res) => {
  try {
    const threshold = req.body.threshold || 3;

    // Find diseases with many ongoing cases in the same location
    const outbreaks = await MedicalRecord.aggregate([
      { $match: { status: "Ongoing", location: { $ne: "" } } },
      { $group: { _id: { disease: "$diagnosis", location: "$location" }, count: { $sum: 1 } } },
      { $match: { count: { $gte: threshold } } },
      { $sort: { count: -1 } },
    ]);

    // Disease spikes — high total cases
    const spikes = await MedicalRecord.aggregate([
      { $group: { _id: "$diagnosis", total: { $sum: 1 }, ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } } } },
      { $match: { ongoing: { $gte: threshold } } },
      { $sort: { ongoing: -1 } },
    ]);

    const newAlerts = [];

    // Generate outbreak alerts
    for (const o of outbreaks) {
      const exists = await Alert.findOne({
        disease: o._id.disease,
        location: o._id.location,
        type: "outbreak",
        acknowledged: false,
      });
      if (!exists) {
        const severity = o.count >= 10 ? "critical" : o.count >= 5 ? "warning" : "info";
        const alert = await Alert.create({
          type: "outbreak",
          severity,
          disease: o._id.disease,
          location: o._id.location,
          message: `${o.count} active cases of ${o._id.disease} detected in ${o._id.location}. Possible outbreak — immediate attention recommended.`,
          caseCount: o.count,
        });
        const sent = await sendAlertEmail(alert);
        alert.emailSent = sent;
        await alert.save();
        newAlerts.push(alert);
      }
    }

    // Generate spike alerts
    for (const s of spikes) {
      const exists = await Alert.findOne({
        disease: s._id,
        type: "spike",
        acknowledged: false,
      });
      if (!exists) {
        const severity = s.ongoing >= 10 ? "critical" : s.ongoing >= 5 ? "warning" : "info";
        const alert = await Alert.create({
          type: "spike",
          severity,
          disease: s._id,
          message: `${s._id} has ${s.ongoing} ongoing cases out of ${s.total} total. Disease activity is elevated.`,
          caseCount: s.ongoing,
        });
        const sent = await sendAlertEmail(alert);
        alert.emailSent = sent;
        await alert.save();
        newAlerts.push(alert);
      }
    }

    res.json({
      message: `Scan complete. ${newAlerts.length} new alert(s) generated.`,
      newAlerts,
    });
  } catch (error) {
    console.error("Alert check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/alerts — list all alerts
router.get("/", auth, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/alerts/:id/acknowledge — mark alert as acknowledged
router.put("/:id/acknowledge", auth, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/alerts/test-email — send a test email
router.post("/test-email", auth, async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const transporter = getTransporter();
    if (!transporter) {
      return res.status(400).json({ message: "Email not configured. Set SMTP_EMAIL and SMTP_APP_PASSWORD in .env" });
    }

    await transporter.sendMail({
      from: `"HealthLedger Alerts" <${process.env.SMTP_EMAIL}>`,
      to: recipientEmail || process.env.ALERT_RECIPIENT || process.env.SMTP_EMAIL,
      subject: "✅ HealthLedger Alert System — Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E5E5; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Test Successful</h1>
          </div>
          <div style="padding: 24px;">
            <p style="color: #333;">Your HealthLedger email alert system is configured correctly!</p>
            <p style="color: #333;">You will receive alerts when disease outbreaks or unusual spikes are detected.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("Test email error:", error.message);
    res.status(500).json({ message: `Email failed: ${error.message}` });
  }
});

export default router;
