import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Loader2,
  MapPin,
} from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DashboardData {
  stats: {
    totalPatients: number; totalDoctors: number; totalRecords: number;
    ongoingCases: number; activePrescriptions: number; todayNewCases: number;
    mostCommon: string;
  };
  diseaseDistribution: { name: string; value: number; color: string }[];
  casesByLocation: { location: string; cases: number }[];
  monthlyTrend: { month: string; cases: number; recovered: number }[];
  recentAlerts: { _id: string; diagnosis: string; location: string; patientName: string; date: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        setData(await res.json());
      } catch { console.error("Failed to fetch admin dashboard"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Patients", value: String(data.stats.totalPatients), icon: Users, change: `${data.stats.totalDoctors} doctors`, positive: true },
    { label: "Active Cases", value: String(data.stats.ongoingCases), icon: Activity, change: `${data.stats.todayNewCases} today`, positive: data.stats.todayNewCases === 0 },
    { label: "Most Common", value: data.stats.mostCommon, icon: AlertTriangle, change: `${data.stats.totalRecords} total records`, positive: false },
    { label: "New Cases Today", value: String(data.stats.todayNewCases), icon: TrendingUp, change: `${data.stats.activePrescriptions} active Rx`, positive: data.stats.todayNewCases === 0 },
  ];

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Disease Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time health analytics and disease surveillance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.positive ? "bg-green-100" : "bg-orange-100"}`}>
                  <stat.icon className={`w-5 h-5 ${stat.positive ? "text-green-600" : "text-orange-600"}`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground block mb-1">{stat.value}</span>
              <h3 className="font-medium text-muted-foreground text-sm">{stat.label}</h3>
              <p className={`text-xs mt-1 ${stat.positive ? "text-green-600" : "text-orange-600"}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Disease Distribution Pie Chart */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Disease Distribution</h2>
            {data.diseaseDistribution.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No data yet — add medical records to see distribution</div>
            ) : (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.diseaseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {data.diseaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {data.diseaseDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Disease Trends</h2>
            {data.monthlyTrend.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No trend data available yet</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="cases" stroke="#2ECC71" strokeWidth={3} dot={{ fill: "#2ECC71", strokeWidth: 2 }} name="Total Cases" />
                    <Line type="monotone" dataKey="recovered" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", strokeWidth: 2 }} name="Recovered" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Cases by Location */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cases by Location</h2>
            {data.casesByLocation.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No location data — set patient locations in Profile</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.casesByLocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis dataKey="location" type="category" stroke="#666" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="cases" fill="#2ECC71" radius={[0, 8, 8, 0]} name="Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Location Map Placeholder */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Disease Heatmap</h2>
            <div className="h-72 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-3">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium text-foreground">Interactive Heatmap</p>
                <p className="text-sm text-muted-foreground mt-1">Geographic disease distribution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="mt-6 bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Disease Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {data.recentAlerts.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No ongoing cases to display</div>
            ) : (
              data.recentAlerts.map((alert) => (
                <div key={alert._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium text-foreground">{alert.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">{alert.patientName} • {alert.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Ongoing</span>
                    <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
