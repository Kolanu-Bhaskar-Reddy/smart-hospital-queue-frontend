import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth, homeFor } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/patient/Doctors';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import QueueTracker from './pages/patient/QueueTracker';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute role="PATIENT" />}>
            <Route path="/patient/doctors" element={<Doctors />} />
            <Route path="/patient/book/:doctorId" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/queue/:id" element={<QueueTracker />} />
          </Route>

          <Route element={<ProtectedRoute role="DOCTOR" />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/departments" element={<ManageDepartments />} />
            <Route path="/admin/patients" element={<ManagePatients />} />
            <Route path="/admin/appointments" element={<ManageAppointments />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
