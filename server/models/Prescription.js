import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Medication name is required"],
    },
    dosage: {
      type: String,
      required: [true, "Dosage is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Expired"],
      default: "Active",
    },
    prescribedBy: {
      type: String,
      default: "",
    },
    prescribedDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
