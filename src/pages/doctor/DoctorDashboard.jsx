import { useState } from 'react';
import api, { errMsg } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import usePolling from '../../hooks/usePolling';
import { fmtTime } from '../../utils/format';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState(null);
  const [today, setToday] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([api.get('/doctor/queue'), api.get('/doctor/appointments/today')])
      .then(([q, t]) => { setQueue(q.data); setToday(t.data); })
      .catch((e) => setError(errMsg(e)));
  usePolling(load, 5000);

  const act = async (fn) => {
    setBusy(true); setError('');
    try { const { data } = await fn(); setQueue(data); load(); } catch (e) { setError(errMsg(e)); }
    setBusy(false);
  };

  if (!queue) return error ? <p className="alert" role="alert">{error}</p> : <p className="muted">Loading today’s queue…</p>;
  const s = queue.nowServing;

  return (
    <>
      <h1>Today’s queue</h1>
      <p className="muted">{queue.departmentName} · {queue.completedCount} of {queue.totalToday} seen</p>
      {error && <p className="alert" role="alert">{error}</p>}

      <section className="card serving">
        {s ? (
          <>
            <div className="ticket-token"><span className="ticket-label">In consultation</span><span className="ticket-number">{s.token}</span></div>
            <div className="ticket-body">
              <h2>{s.patientName}</h2>
              <p className="muted">{s.patientPhone} {s.reason && `· ${s.reason}`}</p>
              <div className="row">
                <button className="btn btn-primary" disabled={busy} onClick={() => act(() => api.put(`/doctor/appointments/${s.id}/complete`))}>Mark consultation complete</button>
                <button className="btn btn-danger" disabled={busy} onClick={() => act(() => api.put(`/doctor/appointments/${s.id}/no-show`))}>Mark no-show</button>
              </div>
            </div>
          </>
        ) : (
          <div className="ticket-body">
            <h2>{queue.waiting.length ? 'Ready for the next patient' : 'Nobody is waiting'}</h2>
            <button className="btn btn-primary" disabled={busy || queue.waiting.length === 0} onClick={() => act(() => api.post('/doctor/queue/call-next'))}>
              Call next patient{queue.waiting[0] ? ` (token ${queue.waiting[0].token})` : ''}
            </button>
          </div>
        )}
      </section>

      <h2>Waiting ({queue.waiting.length})</h2>
      {queue.waiting.length === 0 ? <p className="empty">The waiting list is empty.</p> : (
        <ol className="waitlist">
          {queue.waiting.map((a) => (
            <li key={a.id}>
              <span className="chip">{a.token}</span>
              <span><strong>{a.patientName}</strong><br /><span className="muted">{fmtTime(a.slotTime)} {a.reason && `· ${a.reason}`}</span></span>
              <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => act(() => api.put(`/doctor/appointments/${a.id}/no-show`))}>No-show</button>
            </li>
          ))}
        </ol>
      )}

      <h2>All appointments today</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Token</th><th>Time</th><th>Patient</th><th>Status</th></tr></thead>
          <tbody>
            {today.map((a) => (
              <tr key={a.id}><td>{a.token}</td><td>{fmtTime(a.slotTime)}</td><td>{a.patientName}</td><td><StatusBadge status={a.status} /></td></tr>
            ))}
            {today.length === 0 && <tr><td colSpan="4" className="empty">No appointments booked for today.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
