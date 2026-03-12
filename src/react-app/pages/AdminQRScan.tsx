import { useState, useEffect } from "react";
import { QrCode, Search, Loader2, User, Droplets, FileText, ChevronDown, ChevronUp, Clock, History } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AdminSidebar from "@/react-app/components/AdminSidebar";

interface Patient {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  bloodType: string;
  location: string;
  recordCount: number;
}

interface QRVersion {
  snapshotId: string;
  version: number;
  createdAt: string;
}

export default function AdminQRScan() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, QRVersion[]>>({});
  const [selectedQR, setSelectedQR] = useState<Record<string, QRVersion | null>>({});
  const [baseUrl, setBaseUrl] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPatients();
    fetchBaseUrl();
  }, []);

  const fetchBaseUrl = async () => {
    try {
      const res = await fetch("/api/server-info");
      const data = await res.json();
      setBaseUrl(data.baseUrl);
    } catch {}
  };

  const fetchPatients = async (query = "") => {
    try {
      const url = query
        ? `/api/admin/patients?search=${encodeURIComponent(query)}`
        : "/api/admin/patients";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch {
      console.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchPatients(search);
  };

  const togglePatient = async (patientId: string) => {
    if (expandedId === patientId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(patientId);

    if (!qrMap[patientId]) {
      try {
        const res = await fetch(`/api/qr/history/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const versions: QRVersion[] = await res.json();
        setQrMap((prev) => ({ ...prev, [patientId]: versions }));
        if (versions.length > 0) {
          setSelectedQR((prev) => ({ ...prev, [patientId]: versions[0] }));
        }
      } catch {
        setQrMap((prev) => ({ ...prev, [patientId]: [] }));
      }
    }
  };

  const getQRUrl = (patientId: string) => {
    const selected = selectedQR[patientId];
    if (selected) {
      return `${baseUrl}/api/qr/pdf/${selected.snapshotId}`;
    }
    return `${baseUrl}/api/patient/pdf/${patientId}`;
  };

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Patient QR Cards</h1>
            <p className="text-muted-foreground mt-1">View all patients with versioned QR codes</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-64"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center h-48 text-muted-foreground">
            <User className="w-10 h-10 mb-2" />
            <p className="text-lg font-medium">No patients found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p) => {
              const isExpanded = expandedId === p._id;
              const versions = qrMap[p._id] || [];
              const selected = selectedQR[p._id];

              return (
                <div key={p._id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all">
                  <button
                    onClick={() => togglePatient(p._id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.fullName}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-4 text-sm mr-4">
                        <span className="flex items-center gap-1 text-muted-foreground"><Droplets className="w-3.5 h-3.5" /> {p.bloodType || "—"}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><FileText className="w-3.5 h-3.5" /> {p.recordCount} records</span>
                        {versions.length > 0 && (
                          <span className="flex items-center gap-1 text-primary font-medium"><QrCode className="w-3.5 h-3.5" /> {versions.length} QR(s)</span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border p-5 bg-gray-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* QR Code display */}
                        <div className="flex flex-col items-center">
                          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 inline-block">
                            <QRCodeSVG value={getQRUrl(p._id)} size={180} level="H" includeMargin={false} />
                          </div>
                          {selected && (
                            <p className="text-xs text-muted-foreground mt-3 text-center">
                              Version {selected.version} — {new Date(selected.createdAt).toLocaleDateString()}
                            </p>
                          )}
                          {!selected && (
                            <p className="text-xs text-muted-foreground mt-3 text-center">
                              Live data (no snapshots yet)
                            </p>
                          )}
                        </div>

                        {/* QR version history */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                            <History className="w-4 h-4 text-primary" /> QR Versions
                          </h3>
                          {versions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No QR codes generated yet</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {versions.map((v) => (
                                <button
                                  key={v.snapshotId}
                                  onClick={() => setSelectedQR((prev) => ({ ...prev, [p._id]: v }))}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${
                                    selected?.snapshotId === v.snapshotId
                                      ? "bg-green-50 border border-green-200 font-semibold"
                                      : "bg-white hover:bg-gray-100 border border-border"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <QrCode className="w-3.5 h-3.5 text-primary" />
                                    Version {v.version}
                                  </span>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(v.createdAt).toLocaleDateString()}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Patient details */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Patient Details</h3>
                          <div className="space-y-2 text-sm">
                            {[
                              ["Name", p.fullName],
                              ["Email", p.email],
                              ["Phone", p.phone || "N/A"],
                              ["Gender", p.gender || "N/A"],
                              ["Blood", p.bloodType || "N/A"],
                              ["Location", p.location || "N/A"],
                              ["Records", `${p.recordCount} on file`],
                            ].map(([label, val]) => (
                              <div key={label} className="flex justify-between bg-white p-2 rounded-lg border border-border">
                                <span className="text-muted-foreground text-xs">{label}</span>
                                <span className="font-medium text-foreground text-xs">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
