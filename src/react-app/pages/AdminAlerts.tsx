import { useState, useEffect } from "react";
import { Loader2, Bell, AlertTriangle, ShieldAlert, CheckCircle, Mail, MailCheck, RefreshCw, Send } from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";
import { useToast } from "@/react-app/components/Toast";

interface AlertItem {
  _id: string;
  type: string;
  severity: string;
  disease: string;
  location: string;
  message: string;
  caseCount: number;
  emailSent: boolean;
  acknowledged: boolean;
  createdAt: string;
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [threshold, setThreshold] = useState(3);
  const token = localStorage.getItem("token");
  const toast = useToast();

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAlerts(data);
    } catch {
      console.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/alerts/check", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ threshold }),
      });
      const data = await res.json();
      setStatusMsg(data.message);
      toast.info("Scan Complete", data.message);
      fetchAlerts();
    } catch {
      setStatusMsg("Scan failed. Please try again.");
      toast.error("Scan Failed", "Please try again");
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, acknowledged: true } : a)));
      toast.success("Alert Acknowledged");
    } catch {
      console.error("Failed to acknowledge alert");
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return;
    setTestingEmail(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/alerts/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientEmail: testEmail }),
      });
      const data = await res.json();
      setStatusMsg(data.message);
      toast.success("Email Sent", data.message);
    } catch {
      setStatusMsg("Failed to send test email.");
      toast.error("Email Failed", "Could not send test email");
    } finally {
      setTestingEmail(false);
    }
  };

  const severityColor = (s: string) => {
    if (s === "critical") return { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", badge: "bg-red-100 text-red-700" };
    if (s === "warning") return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", badge: "bg-orange-100 text-orange-700" };
    return { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", badge: "bg-green-100 text-green-700" };
  };

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Disease Alerts</h1>
            <p className="text-muted-foreground mt-1">
              {unacknowledged > 0 ? `${unacknowledged} unacknowledged alert(s)` : "No active alerts"}
            </p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-70"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {scanning ? "Scanning..." : "Scan for Outbreaks"}
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {statusMsg}
          </div>
        )}

        {/* Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Threshold config */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Alert Threshold</h3>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">Minimum ongoing cases of the same disease in a location to trigger an alert:</p>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {[2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n} cases</option>
                ))}
              </select>
            </div>
          </div>

          {/* Test email */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Test Email Alert</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@gmail.com"
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleTestEmail}
                disabled={testingEmail || !testEmail.trim()}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No alerts yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click "Scan for Outbreaks" to check for disease activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const colors = severityColor(alert.severity);
              return (
                <div
                  key={alert._id}
                  className={`rounded-2xl border shadow-sm p-5 transition-all ${
                    alert.acknowledged ? "bg-gray-50 border-border opacity-60" : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.severity === "critical" ? "bg-red-100" : alert.severity === "warning" ? "bg-orange-100" : "bg-green-100"
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${colors.badge}`}>
                            {alert.severity}
                          </span>
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                            {alert.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {alert.disease}{alert.location ? ` — ${alert.location}` : ""}
                          </span>
                          {alert.emailSent && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <MailCheck className="w-3 h-3" /> Emailed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.createdAt).toLocaleString()} · {alert.caseCount} cases
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-xl hover:bg-gray-50 transition-all text-foreground shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
