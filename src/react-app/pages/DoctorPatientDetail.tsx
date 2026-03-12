import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Loader2, Plus, X, Pill, FileText } from "lucide-react";
import DoctorSidebar from "@/react-app/components/DoctorSidebar";

interface PatientDetail {
  patient: {
    _id: string; fullName: string; email: string; phone: string; age: number;
    gender: string; bloodType: string; location: string; address: string;
    allergies: string[]; conditions: string[]; dateOfBirth: string; emergencyContact: string;
  };
  records: { _id: string; date: string; diagnosis: string; doctor: string; treatment: string; status: string; notes: string }[];
  prescriptions: { _id: string; name: string; dosage: string; duration: string; status: string; prescribedBy: string; prescribedDate: string }[];
}

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showRxForm, setShowRxForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordForm, setRecordForm] = useState({ date: new Date().toISOString().slice(0, 10), diagnosis: "", treatment: "", status: "Ongoing", notes: "" });
  const [rxForm, setRxForm] = useState({ name: "", dosage: "", duration: "", prescribedDate: new Date().toISOString().slice(0, 10) });
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/doctor/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`/api/doctor/patients/${id}/records`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(recordForm),
      });
      if (res.ok) { setRecordForm({ date: new Date().toISOString().slice(0, 10), diagnosis: "", treatment: "", status: "Ongoing", notes: "" }); setShowRecordForm(false); fetchData(); }
    } catch { console.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const addRx = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`/api/doctor/patients/${id}/prescriptions`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(rxForm),
      });
      if (res.ok) { setRxForm({ name: "", dosage: "", duration: "", prescribedDate: new Date().toISOString().slice(0, 10) }); setShowRxForm(false); fetchData(); }
    } catch { console.error("Failed"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <DoctorSidebar><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DoctorSidebar>;
  if (!data) return null;
  const p = data.patient;

  return (
    <DoctorSidebar>
      <div className="p-6 lg:p-8">
        {/* Patient Info Header */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{p.fullName}</h1>
              <p className="text-muted-foreground">{p.email} {p.phone && `• ${p.phone}`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.bloodType && <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">{p.bloodType}</span>}
              {p.gender && <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full capitalize">{p.gender}</span>}
              {p.location && <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">{p.location}</span>}
              {p.age > 0 && <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">{p.age} yrs</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div><p className="text-xs text-muted-foreground">DOB</p><p className="text-sm font-medium">{p.dateOfBirth || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm font-medium">{p.address || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Allergies</p><p className="text-sm font-medium">{p.allergies?.length ? p.allergies.join(", ") : "None"}</p></div>
            <div><p className="text-xs text-muted-foreground">Emergency</p><p className="text-sm font-medium">{p.emergencyContact || "—"}</p></div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-2xl border border-border shadow-sm mb-6">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileText className="w-5 h-5" /> Medical Records</h2>
            <button onClick={() => setShowRecordForm(!showRecordForm)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all">
              {showRecordForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showRecordForm ? "Cancel" : "Add Diagnosis"}
            </button>
          </div>

          {showRecordForm && (
            <form onSubmit={addRecord} className="p-5 border-b border-border bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Date</label>
                <input type="date" value={recordForm.date} onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Diagnosis</label>
                <input type="text" value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} required placeholder="e.g. Influenza" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Treatment</label>
                <input type="text" value={recordForm.treatment} onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })} placeholder="e.g. Rest + Fluids" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={recordForm.status} onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="Ongoing">Ongoing</option><option value="Recovered">Recovered</option><option value="Completed">Completed</option><option value="Normal">Normal</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <input type="text" value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} placeholder="Optional notes" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-70 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {submitting ? "Saving..." : "Save Diagnosis"}
                </button>
              </div>
            </form>
          )}

          {data.records.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No records yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Diagnosis</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Treatment</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Doctor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {data.records.map((r) => (
                    <tr key={r._id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 text-sm text-foreground">{r.date}</td>
                      <td className="p-4 text-sm text-foreground font-medium">{r.diagnosis}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{r.treatment || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{r.doctor}</td>
                      <td className="p-4"><span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${["Recovered","Completed","Normal"].includes(r.status) ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Pill className="w-5 h-5" /> Prescriptions</h2>
            <button onClick={() => setShowRxForm(!showRxForm)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all">
              {showRxForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showRxForm ? "Cancel" : "Add Prescription"}
            </button>
          </div>

          {showRxForm && (
            <form onSubmit={addRx} className="p-5 border-b border-border bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Medication Name</label>
                <input type="text" value={rxForm.name} onChange={(e) => setRxForm({ ...rxForm, name: e.target.value })} required placeholder="e.g. Amoxicillin 500mg" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Dosage</label>
                <input type="text" value={rxForm.dosage} onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })} required placeholder="e.g. 3x daily" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Duration</label>
                <input type="text" value={rxForm.duration} onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })} required placeholder="e.g. 7 days" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Date</label>
                <input type="date" value={rxForm.prescribedDate} onChange={(e) => setRxForm({ ...rxForm, prescribedDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-70 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {submitting ? "Saving..." : "Save Prescription"}
                </button>
              </div>
            </form>
          )}

          {data.prescriptions.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No prescriptions yet</div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.prescriptions.map((rx) => (
                <div key={rx._id} className="border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center"><Pill className="w-4 h-4 text-primary" /></div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${rx.status === "Active" ? "bg-green-100 text-green-700" : rx.status === "Completed" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-700"}`}>{rx.status}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{rx.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{rx.dosage} • {rx.duration}</p>
                  {rx.prescribedBy && <p className="text-xs text-muted-foreground mt-1">By {rx.prescribedBy}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorSidebar>
  );
}
