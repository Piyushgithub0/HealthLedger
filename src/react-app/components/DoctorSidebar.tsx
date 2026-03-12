import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  User,
  QrCode,
  LogOut,
  Menu,
  X,
  HeartPulse,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/doctor" },
  { icon: Users, label: "Patients", path: "/doctor/patients" },
  { icon: QrCode, label: "QR Scanner", path: "/doctor/scan" },
  { icon: User, label: "Profile", path: "/doctor/profile" },
];

interface DoctorSidebarProps {
  children: React.ReactNode;
}

export default function DoctorSidebar({ children }: DoctorSidebarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/doctor") return location.pathname === "/doctor";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed h-full">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-700">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">HealthLedger</span>
            <span className="block text-xs text-slate-400">Doctor Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link
            to="/"
            onClick={() => { localStorage.clear(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">HealthLedger</span>
            <span className="block text-xs text-slate-400">Doctor</span>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-slate-900 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path) ? "bg-primary text-white shadow-md shadow-primary/25" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link to="/" onClick={() => { localStorage.clear(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 bg-white">{children}</main>
    </div>
  );
}
