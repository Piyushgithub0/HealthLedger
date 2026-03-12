import { useState, useEffect } from "react";
import { Loader2, Activity, AlertTriangle, MapPin, TrendingUp, ShieldAlert } from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface MonitoringData {
  statusBreakdown: { status: string; count: number; color: string }[];
  diseasesSeverity: { disease: string; total: number; ongoing: number; severityScore: number }[];
  weeklyTrend: { week: string; cases: number }[];
  topLocations: { location: string; cases: number; ongoing: number }[];
  outbreaks: { disease: string; location: string; count: number }[];
}

export default function AdminMonitoring() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/monitoring", { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Failed to fetch monitoring data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Auto-refresh every 30s
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !data) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  const totalCases = data.statusBreakdown.reduce((s, b) => s + b.count, 0);

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Disease Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time disease surveillance &amp; outbreak tracking</p>
        </div>

        {/* Status breakdown cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {data.statusBreakdown.map((s) => (
            <div key={s.status} className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.status}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCases > 0 ? ((s.count / totalCases) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly trend */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Weekly New Cases</h2>
            </div>
            {data.weeklyTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "12px" }} />
                    <Bar dataKey="cases" fill="#2ECC71" radius={[8, 8, 0, 0]} name="New Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No weekly data yet.</p>
            )}
          </div>

          {/* Status Pie */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Case Status Distribution</h2>
            </div>
            {data.statusBreakdown.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} label={(props: any) => `${props.name || ""} ${((props.percent || 0) * 100).toFixed(0)}%`}>
                      {data.statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data available.</p>
            )}
          </div>
        </div>

        {/* Severity + Outbreaks row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Disease severity table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Disease Severity Index</h2>
            </div>
            {data.diseasesSeverity.length > 0 ? (
              <div className="space-y-3">
                {data.diseasesSeverity.map((d) => (
                  <div key={d.disease} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-foreground truncate">{d.disease}</p>
                      <p className="text-xs text-muted-foreground">{d.total} total, {d.ongoing} ongoing</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${d.severityScore}%`,
                            backgroundColor: d.severityScore > 60 ? "#E74C3C" : d.severityScore > 30 ? "#F39C12" : "#2ECC71",
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right" style={{
                        color: d.severityScore > 60 ? "#E74C3C" : d.severityScore > 30 ? "#F39C12" : "#2ECC71",
                      }}>
                        {d.severityScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No severity data yet.</p>
            )}
          </div>

          {/* Active outbreaks */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-foreground">Active Outbreak Alerts</h2>
            </div>
            {data.outbreaks.length > 0 ? (
              <div className="space-y-3">
                {data.outbreaks.map((o, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{o.disease}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {o.location} — {o.count} active cases
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-3">
                  <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">No active outbreaks detected</p>
                <p className="text-xs text-muted-foreground mt-1">All regions are within safe thresholds</p>
              </div>
            )}
          </div>
        </div>

        {/* Top affected locations */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Top Affected Locations</h2>
          </div>
          {data.topLocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total Cases</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ongoing</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.topLocations.map((loc) => {
                    const risk = loc.ongoing > 5 ? "Critical" : loc.ongoing > 2 ? "High" : loc.ongoing > 0 ? "Medium" : "Low";
                    const riskColor = risk === "Critical" ? "bg-red-50 text-red-600" : risk === "High" ? "bg-orange-50 text-orange-600" : risk === "Medium" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-600";
                    return (
                      <tr key={loc.location} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{loc.location}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{loc.cases}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{loc.ongoing}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${riskColor}`}>{risk}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No location data available.</p>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
