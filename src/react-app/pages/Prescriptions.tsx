import { useState, useEffect } from "react";
import { Plus, Pill, Loader2, X } from "lucide-react";
import Sidebar from "@/react-app/components/Sidebar";

interface PrescriptionData {
  _id: string;
  name: string;
  dosage: string;
  duration: string;
  status: string;
  prescribedBy: string;
  prescribedDate: string;
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", dosage: "", duration: "", status: "Active", prescribedBy: "", prescribedDate: "",
  });

  const token = localStorage.getItem("token");

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/patient/prescriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPrescriptions(data);
    } catch {
      console.error("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/patient/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", dosage: "", duration: "", status: "Active", prescribedBy: "", prescribedDate: "" });
        setShowForm(false);
        fetchPrescriptions();
      }
    } catch {
      console.error("Failed to add prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Completed") return "bg-green-50 text-green-600";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Prescriptions</h1>
            <p className="text-muted-foreground mt-1">Manage your medications</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Prescription"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">New Prescription</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Medication Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Amoxicillin 500mg"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Dosage</label>
                <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} required placeholder="e.g. 3x daily"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Duration</label>
                <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required placeholder="e.g. 7 days"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Prescribed By</label>
                <input type="text" value={form.prescribedBy} onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })} placeholder="e.g. Dr. Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Prescribed Date</label>
                <input type="date" value={form.prescribedDate} onChange={(e) => setForm({ ...form, prescribedDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Saving..." : "Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prescriptions Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-lg font-medium">No prescriptions yet</p>
            <p className="text-sm mt-1">Click "Add Prescription" to add your first medication</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.dosage} • {p.duration}</p>
                {p.prescribedBy && (
                  <p className="text-xs text-muted-foreground mt-2">By {p.prescribedBy}</p>
                )}
                {p.prescribedDate && (
                  <p className="text-xs text-muted-foreground">Date: {p.prescribedDate}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
