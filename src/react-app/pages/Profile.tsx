import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import Sidebar from "@/react-app/components/Sidebar";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    conditions: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/patient/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          bloodType: data.bloodType || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          allergies: (data.allergies || []).join(", "),
          conditions: (data.conditions || []).join(", "),
        });
      } catch {
        console.error("Failed to fetch profile");
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
    try {
      const body = {
        ...form,
        allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        conditions: form.conditions ? form.conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        // Update stored user info
        const data = await res.json();
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, fullName: data.fullName }));
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success message */}
            {saved && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm text-center">
                Profile updated successfully!
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input type="email" value={form.email} disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-muted-foreground cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Blood Type</label>
                  <select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Allergies</label>
                  <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Peanuts (comma separated)"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Conditions</label>
                  <input type="text" value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. Diabetes, Asthma (comma separated)"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-foreground">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter your address"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-foreground">Emergency Contact</label>
                  <input type="text" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Name & phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-70">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}
