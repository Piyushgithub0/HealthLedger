import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "react-router";
import DoctorSidebar from "@/react-app/components/DoctorSidebar";

interface Patient {
  _id: string; fullName: string; email: string; phone: string; age: number;
  gender: string; bloodType: string; location: string; recordCount: number;
  activePrescriptions: number; createdAt: string;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = async (query = "") => {
    try {
      const token = localStorage.getItem("token");
      const url = query ? `/api/doctor/patients?search=${encodeURIComponent(query)}` : "/api/doctor/patients";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setPatients(await res.json());
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchPatients(search);
  };

  return (
    <DoctorSidebar>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground mt-1">Search and manage patient records</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, location..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-72"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all">
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-lg font-medium">No patients found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Blood</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Records</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Rx Active</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-medium text-foreground text-sm">{p.fullName}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.location || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{p.bloodType || "—"}</td>
                    <td className="p-4 text-sm text-foreground font-medium">{p.recordCount}</td>
                    <td className="p-4 text-sm text-foreground hidden sm:table-cell">{p.activePrescriptions}</td>
                    <td className="p-4">
                      <Link to={`/doctor/patients/${p._id}`} className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-all">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorSidebar>
  );
}
