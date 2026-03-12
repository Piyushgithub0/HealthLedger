import { useState, useEffect } from "react";
import { Search, Loader2, Users, MapPin, Droplets, FileText, Pill } from "lucide-react";
import AdminSidebar from "@/react-app/components/AdminSidebar";

interface Patient {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  location: string;
  conditions: string[];
  allergies: string[];
  recordCount: number;
  activePrescriptions: number;
  lastDiagnosis: string;
  lastVisit: string;
  createdAt: string;
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const url = search
          ? `/api/admin/patients?search=${encodeURIComponent(search)}`
          : "/api/admin/patients";
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setPatients(data);
      } catch {
        console.error("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <AdminSidebar>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">All Patients</h1>
            <p className="text-muted-foreground mt-1">{patients.length} registered patients</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, location..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-64"
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
        ) : patients.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No patients found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Visit</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-foreground">{p.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.email}</p>
                          {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.location ? (
                          <span className="inline-flex items-center gap-1 text-sm text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> {p.location}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.bloodType && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                              <Droplets className="w-3 h-3" /> {p.bloodType}
                            </span>
                          )}
                          {p.gender && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full capitalize">{p.gender}</span>
                          )}
                          {p.age > 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{p.age} yrs</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-foreground font-medium">{p.lastDiagnosis}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.lastVisit}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-sm text-foreground">
                            <FileText className="w-3.5 h-3.5 text-primary" /> {p.recordCount}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-foreground">
                            <Pill className="w-3.5 h-3.5 text-primary" /> {p.activePrescriptions}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
