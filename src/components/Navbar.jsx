import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';

const LINKS = {
  PATIENT: [['/patient/doctors', 'Find a doctor'], ['/patient/appointments', 'My appointments']],
  DOCTOR: [['/doctor', 'Today’s queue']],
  ADMIN: [
    ['/admin', 'Overview'], ['/admin/doctors', 'Doctors'], ['/admin/departments', 'Departments'],
    ['/admin/patients', 'Patients'], ['/admin/appointments', 'Appointments'],
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const out = () => { logout(); navigate('/login'); };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={user ? homeFor(user.role) : '/login'} className="brand">CareQueue</Link>
        {user && (
          <>
            <nav className="nav-links" aria-label="Main">
              {LINKS[user.role].map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/admin' || to === '/doctor'}>{label}</NavLink>
              ))}
            </nav>
            <div className="nav-user">
              <span>{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={out}>Log out</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
