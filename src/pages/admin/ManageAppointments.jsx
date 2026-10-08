import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { STATUS_LABEL, fmtDate, fmtTime } from '../../utils/format';

export default function ManageAppointments() {
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', doctorId: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  const load = () =>
    api.get('/admin/appointments', { params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) })
      .then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));

  useEffect(() => { api.get('/admin/doctors').then((r) => setDoctors(r.data)); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await api.put(`/admin/appointments/${id}/cancel`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h1>Appointments</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="toolbar">
        <input type="date" value={filters.date} onChange={set('date')} aria-label="Date" />
        <select value={filters.status} onChange={set('status')} aria-label="Status">
          <option value="">Any status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.doctorId} onChange={set('doctorId')} aria-label="Doctor">
          <option value="">Any doctor</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Token</th><th>When</th><th>Patient</th><th>Doctor</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.token}</strong></td>
                <td>{fmtDate(a.date)}<br /><span className="muted">{fmtTime(a.slotTime)}</span></td>
                <td>{a.patientName}<br /><span className="muted">{a.patientPhone}</span></td>
                <td>{a.doctorName}<br /><span className="muted">{a.departmentName}</span></td>
                <td><StatusBadge status={a.status} /></td>
                <td className="actions">{a.status === 'WAITING' && <button className="btn btn-sm btn-danger" onClick={() => cancel(a.id)}>Cancel</button>}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="empty">No appointments match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
