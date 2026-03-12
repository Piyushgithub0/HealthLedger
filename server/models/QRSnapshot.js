import mongoose from "mongoose";

const qrSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    snapshotId: { type: String, required: true, unique: true, index: true },
    version: { type: Number, default: 1 },
    // Frozen patient data at time of QR generation
    patientData: {
      fullName: String,
      email: String,
      phone: String,
      dateOfBirth: String,
      gender: String,
      bloodType: String,
      address: String,
      emergencyContact: String,
      allergies: [String],
      conditions: [String],
    },
    medicalRecords: [
      {
        date: String,
        diagnosis: String,
        doctor: String,
        status: String,
        notes: String,
      },
    ],
    prescriptions: [
      {
        name: String,
        dosage: String,
        duration: String,
        status: String,
        prescribedBy: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.QRSnapshot || mongoose.model("QRSnapshot", qrSnapshotSchema);
