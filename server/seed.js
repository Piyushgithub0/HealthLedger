/**
 * Seed script — populates the database with realistic dummy data.
 * Run:  node server/seed.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import User from "./models/User.js";
import MedicalRecord from "./models/MedicalRecord.js";
import Prescription from "./models/Prescription.js";
import QRSnapshot from "./models/QRSnapshot.js";

const MONGO_URI = process.env.MONGO_URI;

// ---------- helpers ----------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

// ---------- reference data ----------
const locations = ["Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad", "Kolkata", "Jaipur", "Lucknow", "Ahmedabad"];
const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const diseases = [
  "Influenza", "Typhoid", "Malaria", "Dengue", "COVID-19",
  "Tuberculosis", "Pneumonia", "Cholera", "Hepatitis B",
  "Diabetes Type 2", "Hypertension", "Asthma", "Migraine",
  "Gastroenteritis", "Urinary Tract Infection",
];
const treatments = [
  "Antibiotics course", "Antiviral medication", "IV fluids & rest",
  "Insulin therapy", "ACE inhibitors", "Inhaler + steroids",
  "Antimalarial tablets", "ORS & monitored hydration",
  "Paracetamol & rest", "Physiotherapy",
];
const medications = [
  { name: "Amoxicillin", dosage: "500mg 3x/day", duration: "7 days" },
  { name: "Paracetamol", dosage: "650mg as needed", duration: "5 days" },
  { name: "Azithromycin", dosage: "500mg 1x/day", duration: "5 days" },
  { name: "Metformin", dosage: "500mg 2x/day", duration: "90 days" },
  { name: "Amlodipine", dosage: "5mg 1x/day", duration: "30 days" },
  { name: "Salbutamol Inhaler", dosage: "2 puffs PRN", duration: "30 days" },
  { name: "Ciprofloxacin", dosage: "500mg 2x/day", duration: "7 days" },
  { name: "Omeprazole", dosage: "20mg 1x/day", duration: "14 days" },
  { name: "Doxycycline", dosage: "100mg 2x/day", duration: "10 days" },
  { name: "Losartan", dosage: "50mg 1x/day", duration: "30 days" },
  { name: "Chloroquine", dosage: "600mg then 300mg", duration: "3 days" },
  { name: "Oseltamivir", dosage: "75mg 2x/day", duration: "5 days" },
];
const allergiesList = ["Penicillin", "Peanuts", "Shellfish", "Latex", "Dust", "Pollen", "Aspirin", "Sulfa drugs"];
const conditionsList = ["Asthma", "Diabetes", "Hypertension", "Thyroid", "Anemia", "Arthritis"];
const doctorNames = ["Dr. Priya Sharma", "Dr. Rahul Mehta", "Dr. Ananya Verma", "Dr. Vikram Singh", "Dr. Neha Gupta"];
const statuses = ["Ongoing", "Recovered", "Completed", "Normal"];

// ---------- patients data ----------
const patientData = [
  { fullName: "Aarav Patel", email: "aarav.patel@demo.com", phone: "9876543210", gender: "male", age: 28 },
  { fullName: "Diya Sharma", email: "diya.sharma@demo.com", phone: "9876543211", gender: "female", age: 34 },
  { fullName: "Arjun Reddy", email: "arjun.reddy@demo.com", phone: "9876543212", gender: "male", age: 45 },
  { fullName: "Priya Nair", email: "priya.nair@demo.com", phone: "9876543213", gender: "female", age: 29 },
  { fullName: "Rohan Gupta", email: "rohan.gupta@demo.com", phone: "9876543214", gender: "male", age: 52 },
  { fullName: "Sanya Kapoor", email: "sanya.kapoor@demo.com", phone: "9876543215", gender: "female", age: 38 },
  { fullName: "Karthik Iyer", email: "karthik.iyer@demo.com", phone: "9876543216", gender: "male", age: 41 },
  { fullName: "Meera Joshi", email: "meera.joshi@demo.com", phone: "9876543217", gender: "female", age: 26 },
  { fullName: "Aditya Mishra", email: "aditya.mishra@demo.com", phone: "9876543218", gender: "male", age: 33 },
  { fullName: "Tanvi Deshmukh", email: "tanvi.deshmukh@demo.com", phone: "9876543219", gender: "female", age: 47 },
  { fullName: "Raj Malhotra", email: "raj.malhotra@demo.com", phone: "9876543220", gender: "male", age: 55 },
  { fullName: "Anisha Roy", email: "anisha.roy@demo.com", phone: "9876543221", gender: "female", age: 31 },
  { fullName: "Vivek Choudhary", email: "vivek.choudhary@demo.com", phone: "9876543222", gender: "male", age: 36 },
  { fullName: "Pooja Saxena", email: "pooja.saxena@demo.com", phone: "9876543223", gender: "female", age: 42 },
  { fullName: "Siddharth Jain", email: "siddharth.jain@demo.com", phone: "9876543224", gender: "male", age: 30 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clean previous seed data (keep non-demo users)
  const demoEmails = patientData.map((p) => p.email);
  const demoDoctor = "doctor@demo.com";
  const demoAdmin = "admin@demo.com";
  const allDemoEmails = [...demoEmails, demoDoctor, demoAdmin];

  // Remove old demo users and their data
  const oldUsers = await User.find({ email: { $in: allDemoEmails } });
  const oldIds = oldUsers.map((u) => u._id);
  if (oldIds.length > 0) {
    await MedicalRecord.deleteMany({ userId: { $in: oldIds } });
    await Prescription.deleteMany({ userId: { $in: oldIds } });
    await QRSnapshot.deleteMany({ userId: { $in: oldIds } });
    await User.deleteMany({ _id: { $in: oldIds } });
    console.log(`🗑️  Cleaned ${oldIds.length} old demo users & records`);
  }

  // --- Create demo doctor ---
  const doctor = await User.create({
    fullName: "Dr. Priya Sharma",
    email: demoDoctor,
    password: "doctor123",
    role: "doctor",
    phone: "9988776655",
    gender: "female",
    specialization: "General Physician",
    hospital: "HealthLedger Central Hospital",
    experience: "12 years",
    about: "Experienced general physician with expertise in infectious diseases and preventive healthcare.",
  });
  console.log(`👩‍⚕️ Created doctor: ${doctor.email} / doctor123`);

  // --- Create demo admin ---
  const admin = await User.create({
    fullName: "Admin User",
    email: demoAdmin,
    password: "admin123",
    role: "admin",
    phone: "9988776644",
    gender: "male",
  });
  console.log(`🛡️  Created admin: ${admin.email} / admin123`);

  // --- Create patients ---
  const patients = [];
  for (const p of patientData) {
    const user = await User.create({
      fullName: p.fullName,
      email: p.email,
      password: "patient123",
      role: "patient",
      phone: p.phone,
      gender: p.gender,
      age: p.age,
      dateOfBirth: `${1990 - (p.age - 34)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      bloodType: pick(bloodTypes),
      location: pick(locations),
      address: `${Math.floor(Math.random() * 500) + 1}, ${pick(["MG Road", "Station Road", "Park Street", "Lake View", "Ring Road"])}, ${pick(locations)}`,
      emergencyContact: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      allergies: Array.from({ length: Math.floor(Math.random() * 3) }, () => pick(allergiesList)),
      conditions: Array.from({ length: Math.floor(Math.random() * 2) }, () => pick(conditionsList)),
    });
    patients.push(user);
  }
  console.log(`👥 Created ${patients.length} patients (password: patient123)`);

  // --- Create medical records ---
  let recordCount = 0;
  for (const patient of patients) {
    const numRecords = Math.floor(Math.random() * 5) + 2; // 2-6 records
    for (let i = 0; i < numRecords; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      await MedicalRecord.create({
        userId: patient._id,
        date: dateStr(daysAgo),
        diagnosis: pick(diseases),
        doctor: pick(doctorNames),
        treatment: pick(treatments),
        status: pick(statuses),
        location: patient.location,
        notes: `Patient presented with symptoms. ${pick(["Vitals stable.", "Temperature elevated.", "BP slightly high.", "Oxygen levels normal.", "Follow-up required."])}`,
      });
      recordCount++;
    }
  }
  console.log(`📋 Created ${recordCount} medical records`);

  // --- Create prescriptions ---
  let rxCount = 0;
  for (const patient of patients) {
    const numRx = Math.floor(Math.random() * 4) + 1; // 1-4 prescriptions
    for (let i = 0; i < numRx; i++) {
      const med = pick(medications);
      await Prescription.create({
        userId: patient._id,
        name: med.name,
        dosage: med.dosage,
        duration: med.duration,
        status: pick(["Active", "Completed", "Expired"]),
        prescribedBy: pick(doctorNames),
        prescribedDate: dateStr(Math.floor(Math.random() * 90)),
      });
      rxCount++;
    }
  }
  console.log(`💊 Created ${rxCount} prescriptions`);

  // --- Create QR snapshots (2 versions per patient) ---
  let qrCount = 0;
  for (const patient of patients) {
    const records = await MedicalRecord.find({ userId: patient._id });
    const prescriptions = await Prescription.find({ userId: patient._id });

    for (let v = 1; v <= 2; v++) {
      await QRSnapshot.create({
        userId: patient._id,
        snapshotId: crypto.randomBytes(8).toString("hex"),
        version: v,
        patientData: {
          fullName: patient.fullName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodType: patient.bloodType,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          allergies: patient.allergies,
          conditions: patient.conditions,
        },
        medicalRecords: records.slice(0, v === 1 ? Math.ceil(records.length / 2) : records.length).map((r) => ({
          date: r.date,
          diagnosis: r.diagnosis,
          doctor: r.doctor,
          status: r.status,
          notes: r.notes,
        })),
        prescriptions: prescriptions.slice(0, v === 1 ? 1 : prescriptions.length).map((p) => ({
          name: p.name,
          dosage: p.dosage,
          duration: p.duration,
          status: p.status,
          prescribedBy: p.prescribedBy,
        })),
      });
      qrCount++;
    }
  }
  console.log(`📱 Created ${qrCount} QR snapshots`);

  console.log("\n✅ Seeding complete! Demo credentials:");
  console.log("   Patient: any patient email (e.g. aarav.patel@demo.com) / patient123");
  console.log("   Doctor:  doctor@demo.com / doctor123");
  console.log("   Admin:   admin@demo.com / admin123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
