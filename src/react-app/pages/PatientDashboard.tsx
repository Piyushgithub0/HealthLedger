import {
  Calendar,
  Pill,
  Stethoscope,
  Clock,
  Download,
  Edit,
  QrCode,
} from "lucide-react";
import Sidebar from "@/react-app/components/Sidebar";

// Placeholder data
const stats = [
  { label: "Total Visits", value: "24", icon: Calendar, trend: "+3 this month" },
  { label: "Active Prescriptions", value: "5", icon: Pill, trend: "2 expiring soon" },
  { label: "Recent Diagnoses", value: "3", icon: Stethoscope, trend: "Last: 2 weeks ago" },
  { label: "Upcoming Checkups", value: "2", icon: Clock, trend: "Next: Dec 15" },
];

const medicalHistory = [
  { date: "Nov 28, 2024", diagnosis: "Common Cold", doctor: "Dr. Sarah Johnson", status: "Recovered" },
  { date: "Oct 15, 2024", diagnosis: "Annual Checkup", doctor: "Dr. Michael Chen", status: "Completed" },
  { date: "Sep 03, 2024", diagnosis: "Allergic Rhinitis", doctor: "Dr. Emily White", status: "Ongoing" },
  { date: "Jul 22, 2024", diagnosis: "Blood Pressure Check", doctor: "Dr. Sarah Johnson", status: "Normal" },
];

const prescriptions = [
  { name: "Amoxicillin 500mg", dosage: "3x daily", duration: "7 days", status: "Active" },
  { name: "Loratadine 10mg", dosage: "1x daily", duration: "30 days", status: "Active" },
  { name: "Vitamin D3", dosage: "1x daily", duration: "90 days", status: "Active" },
];

const patientInfo = {
  name: "John Anderson",
  id: "HL-2024-001234",
  age: 32,
  bloodType: "O+",
};

export default function PatientDashboard() {
  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome to HealthLedger
          </h1>
          <p className="text-muted-foreground mt-1">
            Hello {patientInfo.name}, here's your health overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <h3 className="font-medium text-foreground">{stat.label}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.trend}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Medical History Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Medical History</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-accent rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                Update Record
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Diagnosis</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Doctor</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.map((record, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 text-sm text-foreground">{record.date}</td>
                      <td className="p-4 text-sm text-foreground font-medium">{record.diagnosis}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{record.doctor}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            record.status === "Recovered" || record.status === "Completed" || record.status === "Normal"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Health Card Preview */}
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">QR Health Card</h2>
            </div>
            <div className="p-5">
              {/* Card Preview */}
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium opacity-90">HealthLedger</span>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-white/70 text-xs mb-1">Patient Name</p>
                  <p className="font-semibold text-lg">{patientInfo.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">ID</p>
                    <p className="font-medium text-sm">{patientInfo.id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">Age</p>
                    <p className="font-medium text-sm">{patientInfo.age}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">Blood</p>
                    <p className="font-medium text-sm">{patientInfo.bloodType}</p>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">Scan for health records</p>
                </div>
              </div>

              {/* Download Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25">
                <Download className="w-4 h-4" />
                Download QR Card
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="mt-6 bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Active Prescriptions</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((prescription, index) => (
                <div
                  key={index}
                  className="border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {prescription.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{prescription.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {prescription.dosage} • {prescription.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
