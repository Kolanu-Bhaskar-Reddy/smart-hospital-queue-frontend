import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import usePolling from '../../hooks/usePolling';
import { fmtDate, fmtTime } from '../../utils/format';

export default function MyAppointments() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/appointments/my').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
  usePolling(load, 15000);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment? Your slot will be released.')) return;
    try { await api.put(`/appointments/${id}/cancel`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h1>My appointments</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      {items && items.length === 0 && (
        <p className="empty">You have no appointments yet. <Link to="/patient/doctors">Find a doctor</Link> to book one.</p>
      )}
      {items && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Token</th><th>When</th><th>Doctor</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.token}</strong></td>
                  <td>{fmtDate(a.date)}<br /><span className="muted">{fmtTime(a.slotTime)}</span></td>
                  <td>{a.doctorName}<br /><span className="muted">{a.departmentName}</span></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="actions">
                    {(a.status === 'WAITING' || a.status === 'IN_PROGRESS') && (
                      <Link className="btn btn-sm" to={`/patient/queue/${a.id}`}>Track queue</Link>
                    )}
                    {a.status === 'WAITING' && <button className="btn btn-sm btn-danger" onClick={() => cancel(a.id)}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
