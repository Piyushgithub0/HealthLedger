import { useState, useEffect } from "react";
import { Save, Loader2, Stethoscope, User, Phone, Building2, Clock, FileText } from "lucide-react";
import DoctorSidebar from "@/react-app/components/DoctorSidebar";

interface DoctorInfo {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  hospital: string;
  experience: string;
  about: string;
  role: string;
}

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<DoctorInfo>({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    hospital: "",
    experience: "",
    about: "",
    role: "doctor",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/doctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          hospital: data.hospital || "",
          experience: data.experience || "",
          about: data.about || "",
          role: data.role || "doctor",
        });
      } catch (e) {
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      // Update stored user name
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, fullName: data.fullName }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DoctorSidebar>
    );
  }

  const initials = form.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DoctorSidebar>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Doctor Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your professional information</p>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25 shrink-0">
            {initials || <User className="w-8 h-8" />}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{form.fullName || "—"}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{form.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {form.specialization && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {form.specialization}
                </span>
              )}
              {form.hospital && (
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                  {form.hospital}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full capitalize">
                {form.role}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {saved && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
                ✓ Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Dr. John Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Professional Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Specialization</span>
                  </label>
                  <select
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    <option value="">Select specialization</option>
                    <option>General Physician</option>
                    <option>Cardiologist</option>
                    <option>Dermatologist</option>
                    <option>Neurologist</option>
                    <option>Orthopedic</option>
                    <option>Pediatrician</option>
                    <option>Psychiatrist</option>
                    <option>Radiologist</option>
                    <option>Surgeon</option>
                    <option>Oncologist</option>
                    <option>Ophthalmologist</option>
                    <option>ENT Specialist</option>
                    <option>Gynecologist</option>
                    <option>Endocrinologist</option>
                    <option>Pulmonologist</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Hospital / Clinic</span>
                  </label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    placeholder="City General Hospital"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Years of Experience</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">About / Bio</h2>
              </div>
              <textarea
                rows={4}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                placeholder="Brief professional bio, areas of interest, achievements..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DoctorSidebar>
  );
}
