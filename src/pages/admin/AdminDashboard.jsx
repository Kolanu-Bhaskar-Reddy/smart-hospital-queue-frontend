import { useState } from 'react';
import api, { errMsg } from '../../api/client';
import usePolling from '../../hooks/usePolling';
import { STATUS_LABEL } from '../../utils/format';

function Bars({ data }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <ul className="bars">
      {Object.entries(data).map(([k, v]) => (
        <li key={k}>
          <span className="bar-label">{STATUS_LABEL[k] || k}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(v / max) * 100}%` }} /></span>
          <span className="bar-value">{v}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState('');

  usePolling(() =>
    Promise.all([api.get('/admin/reports/summary'), api.get('/admin/queues')])
      .then(([s, q]) => { setSummary(s.data); setQueues(q.data); })
      .catch((e) => setError(errMsg(e))), 10000);

  if (!summary) return error ? <p className="alert" role="alert">{error}</p> : <p className="muted">Loading…</p>;

  const stats = [
    ['Appointments today', summary.appointmentsToday], ['Waiting now', summary.waitingNow],
    ['Completed today', summary.completedToday], ['Cancelled today', summary.cancelledToday],
    ['Doctors', summary.totalDoctors], ['Patients', summary.totalPatients],
  ];

  return (
    <>
      <h1>Hospital overview</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="stats">
        {stats.map(([label, n]) => <div className="stat" key={label}><strong>{n}</strong><span>{label}</span></div>)}
      </div>

      <h2>Live queues</h2>
      <div className="grid">
        {queues.map((q) => (
          <article className="card" key={q.doctorId}>
            <h3>{q.doctorName}</h3>
            <p className="muted">{q.departmentName}</p>
            <p>{q.nowServing ? <>Serving token <strong>{q.nowServing.token}</strong> ({q.nowServing.patientName})</> : 'Not serving anyone'}</p>
            <p>{q.waiting.length} waiting · {q.completedCount}/{q.totalToday} seen</p>
          </article>
        ))}
        {queues.length === 0 && <p className="empty">No doctors yet. Add one under Doctors.</p>}
      </div>

      <div className="two-col">
        <section><h2>Appointments by department</h2>{Object.keys(summary.byDepartment).length ? <Bars data={summary.byDepartment} /> : <p className="empty">No appointments yet.</p>}</section>
        <section><h2>Appointments by status</h2>{Object.keys(summary.byStatus).length ? <Bars data={summary.byStatus} /> : <p className="empty">No appointments yet.</p>}</section>
      </div>
    </>
  );
}
