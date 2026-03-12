import { BrowserRouter as Router, Routes, Route } from "react-router";
import Landing from "@/react-app/pages/Landing";
import Login from "@/react-app/pages/Login";
import Register from "@/react-app/pages/Register";
import PatientDashboard from "@/react-app/pages/PatientDashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
