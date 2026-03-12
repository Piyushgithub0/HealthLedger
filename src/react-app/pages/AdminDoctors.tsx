import { useState, useEffect } from "react";
import {
  Search, Loader2, Stethoscope, Mail, Phone, MapPin,
  Pencil, Trash2, X, Check, Building2, Clock
} from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";
import { useToast } from "@/react-app/components/Toast";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  specialization: string;
  hospital: string;
  experience: string;
  about: string;
  location: string;
  casesHandled: number;
  createdAt: string;
}

const emptyForm = {
  fullName: "", email: "", phone: "", gender: "",
  specialization: "", hospital: "", experience: "", about: "", location: "",
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const toast = useToast();

  useEffect(() => {
    fetchDoctors();
  }, [search]);

  const fetchDoctors = async (q = search) => {
    setLoading(true);
    try {
      const url = q ? `/api/admin/doctors?search=${encodeURIComponent(q)}` : "/api/admin/doctors";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(await res.json());
    } catch {
      toast.error("Error", "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setForm({
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone || "",
      gender: doctor.gender || "",
      specialization: doctor.specialization || "",
      hospital: doctor.hospital || "",
      experience: doctor.experience || "",
      about: doctor.about || "",
      location: doctor.location || "",
    });
  };

  const saveEdit = async () => {
    if (!editingDoctor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/doctors/${editingDoctor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved", `${form.fullName}'s profile updated`);
      setEditingDoctor(null);
      fetchDoctors();
    } catch {
      toast.error("Error", "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const deleteDoctor = async (doctor: Doctor) => {
    if (!confirm(`Remove Dr. ${doctor.fullName}? This cannot be undone.`)) return;
    setDeletingId(doctor._id);
    try {
      await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Removed", `${doctor.fullName} removed from system`);
      setDoctors((prev) => prev.filter((d) => d._id !== doctor._id));
    } catch {
      toast.error("Error", "Failed to remove doctor");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Doctors</h1>
            <p className="text-muted-foreground mt-1">{doctors.length} registered doctors</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, specialization..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-72"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all">
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No doctors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {doctors.map((d) => (
              <div key={d._id} className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all">
                {/* Avatar + name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{d.fullName}</p>
                      <p className="text-xs text-blue-600 font-medium">{d.specialization || "General Physician"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(d)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all text-muted-foreground"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDoctor(d)}
                      disabled={deletingId === d._id}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-red-500 hover:text-white transition-all text-muted-foreground disabled:opacity-50"
                      title="Remove"
                    >
                      {deletingId === d._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{d.email}</span>
                  </div>
                  {d.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{d.phone}</span>
                    </div>
                  )}
                  {d.hospital && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{d.hospital}</span>
                    </div>
                  )}
                  {d.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{d.location}</span>
                    </div>
                  )}
                  {d.experience && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{d.experience}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    {d.casesHandled} cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingDoctor(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Edit Doctor</h2>
              <button onClick={() => setEditingDoctor(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: "Full Name", key: "fullName", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Specialization", key: "specialization", type: "text" },
                { label: "Hospital / Clinic", key: "hospital", type: "text" },
                { label: "Experience", key: "experience", type: "text" },
                { label: "Location", key: "location", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">About</label>
                <textarea
                  rows={3}
                  value={form.about}
                  onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-border">
              <button
                onClick={() => setEditingDoctor(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
