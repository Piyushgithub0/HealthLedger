import { useState, useEffect } from "react";
import { Loader2, FileBarChart, Download, Users, MapPin, Stethoscope, Pill, Calendar } from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";

interface ReportData {
  overview: { totalPatients: number; totalDoctors: number; totalRecords: number; totalPrescriptions: number };
  diseaseSummary: { disease: string; total: number; ongoing: number; recovered: number }[];
  locationSummary: { location: string; total: number; ongoing: number }[];
  doctorActivity: { doctor: string; cases: number }[];
  monthlySummary: { month: string; cases: number; recovered: number }[];
  prescriptionSummary: { name: string; count: number; active: number }[];
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"disease" | "location" | "doctor" | "prescription" | "monthly">("disease");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/reports", { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  const tabs = [
    { key: "disease" as const, label: "Diseases", icon: FileBarChart },
    { key: "location" as const, label: "Locations", icon: MapPin },
    { key: "doctor" as const, label: "Doctors", icon: Stethoscope },
    { key: "prescription" as const, label: "Prescriptions", icon: Pill },
    { key: "monthly" as const, label: "Monthly", icon: Calendar },
  ];

  const handleDownload = () => {
    if (activeTab === "disease") {
      downloadCSV("disease_report.csv", ["Disease", "Total Cases", "Ongoing", "Recovered"],
        data.diseaseSummary.map((d) => [d.disease, String(d.total), String(d.ongoing), String(d.recovered)]));
    } else if (activeTab === "location") {
      downloadCSV("location_report.csv", ["Location", "Total Cases", "Ongoing"],
        data.locationSummary.map((l) => [l.location, String(l.total), String(l.ongoing)]));
    } else if (activeTab === "doctor") {
      downloadCSV("doctor_report.csv", ["Doctor", "Cases Handled"],
        data.doctorActivity.map((d) => [d.doctor, String(d.cases)]));
    } else if (activeTab === "prescription") {
      downloadCSV("prescription_report.csv", ["Medication", "Times Prescribed", "Currently Active"],
        data.prescriptionSummary.map((p) => [p.name, String(p.count), String(p.active)]));
    } else if (activeTab === "monthly") {
      downloadCSV("monthly_report.csv", ["Month", "Total Cases", "Recovered"],
        data.monthlySummary.map((m) => [m.month, String(m.cases), String(m.recovered)]));
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Comprehensive health data reports from the database</p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Patients", value: data.overview.totalPatients, icon: Users, color: "text-primary" },
            { label: "Doctors", value: data.overview.totalDoctors, icon: Stethoscope, color: "text-primary" },
            { label: "Records", value: data.overview.totalRecords, icon: FileBarChart, color: "text-primary" },
            { label: "Prescriptions", value: data.overview.totalPrescriptions, icon: Pill, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-white text-muted-foreground border border-border hover:text-foreground hover:border-primary/30"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "disease" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disease</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Cases</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ongoing</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovered</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.diseaseSummary.map((d) => (
                    <tr key={d.disease} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{d.disease}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{d.total}</td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">{d.ongoing}</span></td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">{d.recovered}</span></td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{d.total > 0 ? ((d.recovered / d.total) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "location" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Cases</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ongoing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.locationSummary.map((l) => (
                    <tr key={l.location} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{l.location}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{l.total}</td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">{l.ongoing}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "doctor" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cases Handled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.doctorActivity.map((d) => (
                    <tr key={d.doctor} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-primary" />{d.doctor}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{d.cases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "prescription" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medication</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Times Prescribed</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currently Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.prescriptionSummary.map((p) => (
                    <tr key={p.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-primary" />{p.name}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{p.count}</td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">{p.active}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "monthly" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Cases</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovered</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.monthlySummary.map((m) => (
                    <tr key={m.month} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />{m.month}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{m.cases}</td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">{m.recovered}</span></td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{m.cases > 0 ? ((m.recovered / m.cases) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty state */}
            {((activeTab === "disease" && data.diseaseSummary.length === 0) ||
              (activeTab === "location" && data.locationSummary.length === 0) ||
              (activeTab === "doctor" && data.doctorActivity.length === 0) ||
              (activeTab === "prescription" && data.prescriptionSummary.length === 0) ||
              (activeTab === "monthly" && data.monthlySummary.length === 0)) && (
              <div className="text-center py-16">
                <FileBarChart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No data available for this report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
