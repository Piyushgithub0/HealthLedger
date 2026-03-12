import { useState, useEffect } from "react";
import {
  Calendar,
  Pill,
  Stethoscope,
  Clock,
  Download,
  QrCode,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "@/react-app/components/Sidebar";

interface DashboardData {
  user: {
    fullName: string;
    email: string;
    role: string;
    bloodType: string;
  };
  stats: {
    totalVisits: number;
    activePrescriptions: number;
    ongoingDiagnoses: number;
  };
  recentRecords: {
    _id: string;
    date: string;
    diagnosis: string;
    doctor: string;
    status: string;
  }[];
  recentPrescriptions: {
    _id: string;
    name: string;
    dosage: string;
    duration: string;
    status: string;
  }[];
}

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
        const res = await fetch("/api/patient/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);

        // Fetch network URL for QR
        const infoRes = await fetch("/api/server-info");
        const infoData = await infoRes.json();
        setPdfUrl(`${infoData.baseUrl}/api/patient/pdf/${userId}`);
      } catch {
        console.error("Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Sidebar>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Visits", value: String(data.stats.totalVisits), icon: Calendar, trend: "All time records" },
    { label: "Active Prescriptions", value: String(data.stats.activePrescriptions), icon: Pill, trend: "Currently active" },
    { label: "Ongoing Diagnoses", value: String(data.stats.ongoingDiagnoses), icon: Stethoscope, trend: "Needs attention" },
    { label: "Blood Type", value: data.user.bloodType, icon: Clock, trend: "Update in Profile" },
  ];

  const userId = JSON.parse(localStorage.getItem("user") || "{}").id || "";

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome to HealthLedger
          </h1>
          <p className="text-muted-foreground mt-1">
            Hello {data.user.fullName}, here's your health overview
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
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Medical History</h2>
            </div>
            {data.recentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p className="text-sm">No medical records yet</p>
                <p className="text-xs mt-1">Visit Medical History to add records</p>
              </div>
            ) : (
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
                    {data.recentRecords.map((record) => (
                      <tr key={record._id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 text-sm text-foreground">{record.date}</td>
                        <td className="p-4 text-sm text-foreground font-medium">{record.diagnosis}</td>
                        <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{record.doctor}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                              ["Recovered", "Completed", "Normal"].includes(record.status)
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
            )}
          </div>

          {/* QR Health Card Preview */}
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">QR Health Card</h2>
            </div>
            <div className="p-5">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium opacity-90">HealthLedger</span>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-white/70 text-xs mb-1">Patient Name</p>
                  <p className="font-semibold text-lg">{data.user.fullName}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">ID</p>
                    <p className="font-medium text-sm">{userId.slice(-6).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">Visits</p>
                    <p className="font-medium text-sm">{data.stats.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">Blood</p>
                    <p className="font-medium text-sm">{data.user.bloodType}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-white rounded-lg flex items-center justify-center mb-2">
                    {pdfUrl ? (
                      <QRCodeSVG value={pdfUrl} size={88} level="H" />
                    ) : (
                      <QrCode className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Scan to download health report</p>
                </div>
              </div>

              <button
                onClick={() => { if (pdfUrl) window.open(pdfUrl, "_blank"); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                <Download className="w-4 h-4" />
                Download Health PDF
              </button>
            </div>
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="mt-6 bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Active Prescriptions</h2>
          </div>
          <div className="p-5">
            {data.recentPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                <p className="text-sm">No active prescriptions</p>
                <p className="text-xs mt-1">Visit Prescriptions to add medications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recentPrescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
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
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
