import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import Registration from "./pages/auth/Registration";
import DirectorLayout from "./layouts/DirectorLayout";
import NewPatient from "./pages/patients/NewPatient";
import AllPatients from "./pages/patients/AllPatients";
import PatientDashboard from "./pages/patients/PatientDashboard";
import PatientsJournal from "./pages/patients/PatientsJournal";
import JournalRecords from "./pages/patients/JournalRecords";
import StaffDashboard from './pages/staff/StaffDashboard';
import AllStaff from './pages/staff/AllStaff';
import NewStaff from './pages/staff/NewStaff';
import StaffDetails from './pages/staff/StaffDetails';
import EditStaff from './pages/staff/EditStaff';
import PatientCheckIn from './pages/patients/PatientCheckIn';
import Chat from './pages/patients/Chat';
import ProgressInsights from './pages/patients/ProgressInsights';
import PatientProfile from './pages/patients/PatientProfile';
import MyPatients from "./pages/staff/MyPatients";
import HighRiskPatients from "./pages/patients/HighRiskPatients";
import RelapseRiskMonitor from "./pages/patients/RelapseRiskMonitor";

function App() {
  return (
    <Routes>

      {/* 🔐 Default → Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 🔐 Login */}
      <Route path="/login" element={<Login />} />

      {/* 🎯 Director Section */}
      <Route path="/director" element={<DirectorLayout />}>

        {/* Dashboard */}
        <Route index element={<DirectorDashboard />} />

        {/* Admin → New User */}
        <Route path="admin/new-user" element={<Registration />} />

        {/* Patients */}
        <Route path="patients/new" element={<NewPatient />} />
        <Route path="patients/all-patients" element={<AllPatients />} />
        <Route path="patients/patient-dashboard" element={<PatientDashboard />} />
        <Route path="patients/journal" element={<PatientsJournal />} />
        
        <Route path="patients/journal-records" element={<JournalRecords />} />
        <Route path="patients/check-in" element={<PatientCheckIn />} />
        <Route path="patients/chat" element={ <Chat />} />
        <Route path="patients/progress" element={ <ProgressInsights />} />
        <Route path="patients/patient-profile" element={<PatientProfile />} />
        <Route path="patients/alerts" element={<HighRiskPatients />} />
        <Route path="patients/relapse-monitor" element={<RelapseRiskMonitor />} />
        
        

        <Route path="staff/staff-dashboard" element={<StaffDashboard />} />
        <Route path="staff/all" element={<AllStaff />} />
        <Route path="staff/my-patients" element={<MyPatients />} />
        <Route path="staff/new" element={<NewStaff />} />
        <Route path="staff/:id" element={<StaffDetails />} />
        <Route path="staff/edit/:id" element={<EditStaff />} />

        
        
        

      </Route>

      {/* ❌ Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;