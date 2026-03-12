import { BrowserRouter as Router, Routes, Route } from "react-router";
import Landing from "@/react-app/pages/Landing";
import Login from "@/react-app/pages/Login";
import Register from "@/react-app/pages/Register";
import PatientDashboard from "@/react-app/pages/PatientDashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import AdminPatients from "@/react-app/pages/AdminPatients";
import AdminMonitoring from "@/react-app/pages/AdminMonitoring";
import AdminReports from "@/react-app/pages/AdminReports";
import AdminSettings from "@/react-app/pages/AdminSettings";
import HealthCard from "@/react-app/pages/HealthCard";
import MedicalHistory from "@/react-app/pages/MedicalHistory";
import Prescriptions from "@/react-app/pages/Prescriptions";
import Profile from "@/react-app/pages/Profile";
import DoctorDashboard from "@/react-app/pages/DoctorDashboard";
import DoctorPatients from "@/react-app/pages/DoctorPatients";
import DoctorPatientDetail from "@/react-app/pages/DoctorPatientDetail";
import DoctorProfile from "@/react-app/pages/DoctorProfile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Patient */}
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/dashboard/health-card" element={<HealthCard />} />
        <Route path="/dashboard/history" element={<MedicalHistory />} />
        <Route path="/dashboard/prescriptions" element={<Prescriptions />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        {/* Doctor */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/monitoring" element={<AdminMonitoring />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
}
