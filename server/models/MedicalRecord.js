import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
    },
    doctor: {
      type: String,
      required: [true, "Doctor name is required"],
    },
    treatment: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Ongoing", "Recovered", "Completed", "Normal"],
      default: "Ongoing",
    },
    location: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
