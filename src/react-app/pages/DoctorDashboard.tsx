import { useState, useEffect } from "react";
import { Users, FileText, Stethoscope, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router";
import DoctorSidebar from "@/react-app/components/DoctorSidebar";

interface DashboardData {
  stats: { totalPatients: number; totalRecords: number; ongoingCases: number; todayRecords: number };
  recentRecords: { _id: string; date: string; diagnosis: string; doctor: string; status: string; treatment: string; patientName: string; patientId: string }[];
}

export default function DoctorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/doctor/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        setData(await res.json());
      } catch { console.error("Failed to fetch"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <DoctorSidebar><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DoctorSidebar>;
  if (!data) return null;

  const stats = [
    { label: "Total Patients", value: data.stats.totalPatients, icon: Users, desc: "Registered patients" },
    { label: "Medical Records", value: data.stats.totalRecords, icon: FileText, desc: "All records" },
    { label: "Ongoing Cases", value: data.stats.ongoingCases, icon: Stethoscope, desc: "Needs attention" },
    { label: "Today's Visits", value: data.stats.todayRecords, icon: Calendar, desc: new Date().toLocaleDateString() },
  ];

  return (
    <DoctorSidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, Dr. {user.fullName}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
              </div>
              <h3 className="font-medium text-foreground">{s.label}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Medical Records</h2>
              <Link to="/doctor/patients" className="text-sm text-primary font-medium hover:text-primary/80">View All Patients →</Link>
            </div>
            {data.recentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p className="text-sm">No records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Diagnosis</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr></thead>
                  <tbody>
                    {data.recentRecords.map((r) => (
                      <tr key={r._id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                        <td className="p-4">
                          <Link to={`/doctor/patients/${r.patientId}`} className="text-sm text-primary font-medium hover:underline">{r.patientName}</Link>
                        </td>
                        <td className="p-4 text-sm text-foreground">{r.diagnosis}</td>
                        <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{r.date}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            ["Recovered","Completed","Normal"].includes(r.status) ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/doctor/patients" className="block w-full p-4 bg-accent rounded-xl text-primary font-medium hover:bg-green-100 transition-colors text-center">
                View All Patients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DoctorSidebar>
  );
}
