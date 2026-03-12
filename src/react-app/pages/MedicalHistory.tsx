import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";
import Sidebar from "@/react-app/components/Sidebar";

interface Record {
  _id: string;
  date: string;
  diagnosis: string;
  doctor: string;
  status: string;
  notes: string;
}

export default function MedicalHistory() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: "", diagnosis: "", doctor: "", status: "Ongoing", notes: "" });

  const token = localStorage.getItem("token");

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/patient/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecords(data);
    } catch {
      console.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/patient/history", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ date: "", diagnosis: "", doctor: "", status: "Ongoing", notes: "" });
        setShowForm(false);
        fetchRecords();
      }
    } catch {
      console.error("Failed to add record");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    if (["Recovered", "Completed", "Normal"].includes(status)) return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Medical History</h1>
            <p className="text-muted-foreground mt-1">Your complete medical records</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Record"}
          </button>
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">New Medical Record</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Diagnosis</label>
                <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required placeholder="e.g. Common Cold"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Doctor</label>
                <input type="text" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required placeholder="e.g. Dr. Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                  <option value="Ongoing">Ongoing</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Completed">Completed</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Notes (Optional)</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="text-lg font-medium">No records yet</p>
              <p className="text-sm mt-1">Click "Add Record" to add your first medical record</p>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 text-sm text-foreground">{record.date}</td>
                      <td className="p-4 text-sm text-foreground font-medium">{record.diagnosis}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{record.doctor}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{record.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
