import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/admin/patients').then((r) => setPatients(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const toggle = async (p) => {
    try { await api.put(`/admin/patients/${p.id}/active`, null, { params: { value: !p.active } }); load(); }
    catch (e) { setError(errMsg(e)); }
  };

  const shown = patients.filter((p) => (p.name + p.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>Patients</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="toolbar"><input type="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td><td>{p.email}</td><td>{p.phone}</td>
                <td>{p.active ? 'Active' : 'Blocked'}</td>
                <td className="actions"><button className={`btn btn-sm ${p.active ? 'btn-danger' : ''}`} onClick={() => toggle(p)}>{p.active ? 'Block' : 'Unblock'}</button></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="5" className="empty">No patients found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
