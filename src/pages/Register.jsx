import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { errMsg } from '../api/client';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await register(form);
      navigate(homeFor(u.role));
    } catch (err) { setError(errMsg(err)); }
    setBusy(false);
  };

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1>Create your patient account</h1>
        <p>It takes a minute. Doctor and admin accounts are created by the hospital.</p>
      </div>
      <form className="card form" onSubmit={submit}>
        {error && <p className="alert" role="alert">{error}</p>}
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Phone<input type="tel" value={form.phone} onChange={set('phone')} /></label>
        <label>Password (6+ characters)
          <input type="password" minLength={6} required value={form.password} onChange={set('password')} />
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
