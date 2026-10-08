import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { errMsg } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(form.email, form.password);
      navigate(homeFor(u.role));
    } catch (err) { setError(errMsg(err)); }
    setBusy(false);
  };

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1>Skip the waiting room.</h1>
        <p>Book a doctor, get a token, and watch your place in line from your phone.</p>
      </div>
      <form className="card form" onSubmit={submit}>
        <h2>Log in</h2>
        {error && <p className="alert" role="alert">{error}</p>}
        <label>Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted">New patient? <Link to="/register">Create an account</Link></p>
        <details className="demo">
          <summary>Demo accounts</summary>
          <p>Admin: admin@hospital.com / Admin@123</p>
          <p>Doctor: asha@hospital.com / Doctor@123</p>
          <p>Patient: patient@hospital.com / Patient@123</p>
        </details>
      </form>
    </section>
  );
}
