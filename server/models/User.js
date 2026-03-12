import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    // Profile fields
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    bloodType: { type: String, default: "" },
    address: { type: String, default: "" },
    location: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    // Doctor-specific fields
    specialization: { type: String, default: "" },
    hospital: { type: String, default: "" },
    experience: { type: String, default: "" },
    about: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
