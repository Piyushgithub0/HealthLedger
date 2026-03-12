import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
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

// Stats data
const stats = [
  { label: "Total Patients", value: "12,847", icon: Users, change: "+142 this week", positive: true },
  { label: "Active Disease Cases", value: "1,234", icon: Activity, change: "+23 today", positive: false },
  { label: "Most Common Disease", value: "Influenza", icon: AlertTriangle, change: "38% of cases", positive: false },
  { label: "New Cases Today", value: "47", icon: TrendingUp, change: "-12% vs yesterday", positive: true },
];

// Disease distribution data
const diseaseDistribution = [
  { name: "Influenza", value: 380, color: "#2ECC71" },
  { name: "COVID-19", value: 290, color: "#3498DB" },
  { name: "Dengue", value: 180, color: "#E74C3C" },
  { name: "Typhoid", value: 120, color: "#F39C12" },
  { name: "Malaria", value: 95, color: "#9B59B6" },
  { name: "Others", value: 169, color: "#95A5A6" },
];

// Monthly trend data
const monthlyTrend = [
  { month: "Jul", cases: 820, recovered: 750, deaths: 12 },
  { month: "Aug", cases: 950, recovered: 880, deaths: 15 },
  { month: "Sep", cases: 1100, recovered: 980, deaths: 18 },
  { month: "Oct", cases: 890, recovered: 820, deaths: 10 },
  { month: "Nov", cases: 1250, recovered: 1100, deaths: 20 },
  { month: "Dec", cases: 1234, recovered: 950, deaths: 14 },
];

// Cases by location
const casesByLocation = [
  { location: "Metro Manila", cases: 450 },
  { location: "Cebu", cases: 280 },
  { location: "Davao", cases: 220 },
  { location: "Iloilo", cases: 150 },
  { location: "Baguio", cases: 90 },
];

export default function AdminDashboard() {
  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        {/* Header */}
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
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.positive ? "bg-green-100" : "bg-orange-100"
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.positive ? "text-green-600" : "text-orange-600"
                  }`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground block mb-1">{stat.value}</span>
              <h3 className="font-medium text-muted-foreground text-sm">{stat.label}</h3>
              <p className={`text-xs mt-1 ${
                stat.positive ? "text-green-600" : "text-orange-600"
              }`}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Disease Distribution Pie Chart */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Disease Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {diseaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {diseaseDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Line Chart */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Disease Trends</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#2ECC71"
                    strokeWidth={3}
                    dot={{ fill: "#2ECC71", strokeWidth: 2 }}
                    name="Total Cases"
                  />
                  <Line
                    type="monotone"
                    dataKey="recovered"
                    stroke="#3498DB"
                    strokeWidth={3}
                    dot={{ fill: "#3498DB", strokeWidth: 2 }}
                    name="Recovered"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Cases by Location Bar Chart */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cases by Location</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByLocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" stroke="#666" fontSize={12} />
                  <YAxis dataKey="location" type="category" stroke="#666" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="cases" fill="#2ECC71" radius={[0, 8, 8, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disease Heatmap Placeholder */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Disease Heatmap</h2>
            <div className="h-72 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-3">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium text-foreground">Interactive Heatmap</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Geographic disease distribution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Disease Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { disease: "Influenza Outbreak", location: "Metro Manila", severity: "High", time: "2 hours ago" },
              { disease: "Dengue Cases Spike", location: "Cebu City", severity: "Medium", time: "5 hours ago" },
              { disease: "COVID-19 Cluster", location: "Davao", severity: "High", time: "8 hours ago" },
              { disease: "Typhoid Cases", location: "Iloilo", severity: "Low", time: "12 hours ago" },
            ].map((alert, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === "High" ? "bg-red-500" :
                    alert.severity === "Medium" ? "bg-yellow-500" : "bg-green-500"
                  }`} />
                  <div>
                    <p className="font-medium text-foreground">{alert.disease}</p>
                    <p className="text-sm text-muted-foreground">{alert.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                    alert.severity === "High" ? "bg-red-100 text-red-700" :
                    alert.severity === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                    {alert.severity}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
