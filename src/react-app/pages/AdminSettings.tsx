import { useState, useEffect } from "react";
import { Save, Loader2, User, Shield, Bell } from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [notifSettings, setNotifSettings] = useState({
    outbreakAlerts: true,
    newPatientAlerts: true,
    weeklyDigest: true,
    outbreakThreshold: 3,
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        // We'll fetch admin info from the stored user for now
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setForm({
          fullName: stored.fullName || "",
          email: stored.email || "",
          phone: stored.phone || "",
        });
        // Load notification settings from local storage
        const notifs = JSON.parse(localStorage.getItem("adminNotifSettings") || "null");
        if (notifs) setNotifSettings(notifs);
      } catch {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Save notification settings locally
      localStorage.setItem("adminNotifSettings", JSON.stringify(notifSettings));
      // Update stored user name
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, fullName: form.fullName, phone: form.phone }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your admin account and notification preferences</p>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium mb-6">
            ✓ Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Admin Profile */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Admin Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                <label className="block text-sm font-medium text-foreground">Phone</label>
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

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "outbreakAlerts" as const, label: "Outbreak Alerts", desc: "Get notified when a disease outbreak is detected in any location" },
                { key: "newPatientAlerts" as const, label: "New Patient Registrations", desc: "Receive alerts when new patients register on the platform" },
                { key: "weeklyDigest" as const, label: "Weekly Health Digest", desc: "Receive a weekly summary of disease trends and system activity" },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between p-4 rounded-xl bg-gray-50/50 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !notifSettings[item.key] })}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${
                      notifSettings[item.key] ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifSettings[item.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-gray-50/50 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Outbreak Alert Threshold</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Minimum active cases of the same disease in a location to trigger an alert</p>
                  </div>
                  <select
                    value={notifSettings.outbreakThreshold}
                    onChange={(e) => setNotifSettings({ ...notifSettings, outbreakThreshold: Number(e.target.value) })}
                    className="px-3 py-1.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0 ml-4"
                  >
                    {[2, 3, 5, 10].map((n) => (
                      <option key={n} value={n}>{n} cases</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border">
                <p className="text-sm font-semibold text-foreground">Role</p>
                <p className="text-xs text-muted-foreground mt-1">You are logged in as an <span className="text-primary font-semibold">Administrator</span></p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/50 border border-border">
                <p className="text-sm font-semibold text-foreground">Session</p>
                <p className="text-xs text-muted-foreground mt-1">Your session is active. Click logout in the sidebar to end your session.</p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
