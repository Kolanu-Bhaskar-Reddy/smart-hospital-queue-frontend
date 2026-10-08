import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import { fmtTime } from '../../utils/format';

const EMPTY = {
  name: '', email: '', password: '', phone: '', departmentId: '', specialization: '',
  consultationMinutes: 15, startTime: '09:00', endTime: '13:00',
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => api.get('/admin/doctors').then((r) => setDoctors(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); api.get('/admin/departments').then((r) => setDepartments(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault(); setError('');
    const body = { ...form, departmentId: Number(form.departmentId), consultationMinutes: Number(form.consultationMinutes) };
    try {
      if (editing) await api.put(`/admin/doctors/${editing}`, body);
      else await api.post('/admin/doctors', body);
      setForm(EMPTY); setEditing(null); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (d) => {
    setEditing(d.id);
    setForm({ name: d.name, email: d.email, password: '', phone: d.phone || '', departmentId: d.departmentId,
      specialization: d.specialization || '', consultationMinutes: d.consultationMinutes,
      startTime: d.startTime.slice(0, 5), endTime: d.endTime.slice(0, 5) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (d) => {
    if (!window.confirm(`Deactivate ${d.name}? Their upcoming waiting appointments will be cancelled.`)) return;
    try { await api.delete(`/admin/doctors/${d.id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h1>Doctors</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <form className="card form grid-form" onSubmit={save}>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email (login)<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>{editing ? 'New password (leave blank to keep)' : 'Password'}
          <input type="password" minLength={editing ? 0 : 6} required={!editing} value={form.password} onChange={set('password')} />
        </label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <label>Department
          <select required value={form.departmentId} onChange={set('departmentId')}>
            <option value="">Choose…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>Specialization<input value={form.specialization} onChange={set('specialization')} /></label>
        <label>Minutes per patient<input type="number" min="5" max="120" required value={form.consultationMinutes} onChange={set('consultationMinutes')} /></label>
        <label>Starts<input type="time" required value={form.startTime} onChange={set('startTime')} /></label>
        <label>Ends<input type="time" required value={form.endTime} onChange={set('endTime')} /></label>
        <div className="row full">
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Add doctor'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Doctor</th><th>Department</th><th>Hours</th><th>Per patient</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong><br /><span className="muted">{d.email}</span></td>
                <td>{d.departmentName}<br /><span className="muted">{d.specialization}</span></td>
                <td>{fmtTime(d.startTime)} to {fmtTime(d.endTime)}</td>
                <td>{d.consultationMinutes} min</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => edit(d)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(d)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
