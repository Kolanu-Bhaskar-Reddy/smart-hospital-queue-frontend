import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import usePolling from '../../hooks/usePolling';
import { fmtDate, fmtTime } from '../../utils/format';

function headline(q) {
  if (q.status === 'IN_PROGRESS') return 'The doctor is ready for you. Please go in.';
  if (q.status === 'COMPLETED') return 'Your consultation is complete.';
  if (q.status === 'CANCELLED') return 'This appointment was cancelled.';
  if (q.status === 'NO_SHOW') return 'You were marked as not present.';
  if (!q.live) return `Your queue opens on ${fmtDate(q.date)}.`;
  if (q.patientsAhead === 0) return 'You are next.';
  return `${q.patientsAhead} ${q.patientsAhead === 1 ? 'patient' : 'patients'} ahead of you`;
}

export default function QueueTracker() {
  const { id } = useParams();
  const [q, setQ] = useState(null);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(null);

  usePolling(() =>
    api.get(`/appointments/${id}/queue`)
      .then((r) => { setQ(r.data); setUpdated(new Date()); setError(''); })
      .catch((e) => setError(errMsg(e))), 5000, [id]);

  if (!q) return error ? <p className="alert" role="alert">{error}</p> : <p className="muted">Loading your queue…</p>;

  return (
    <>
      <h1>Your place in line</h1>
      {error && <p className="alert" role="alert">Connection problem: {error}. Retrying…</p>}
      <section className={`ticket ${q.status === 'IN_PROGRESS' ? 'ticket-now' : ''}`} aria-live="polite">
        <div className="ticket-token">
          <span className="ticket-label">Your token</span>
          <span className="ticket-number">{q.token}</span>
        </div>
        <div className="ticket-body">
          <h2>{headline(q)}</h2>
          <StatusBadge status={q.status} />
          <dl className="facts">
            <div><dt>Now serving</dt><dd>{q.nowServingToken ?? '–'}</dd></div>
            {q.status === 'WAITING' && q.live && (
              <div><dt>Estimated wait</dt><dd>{q.estimatedWaitMinutes === 0 ? 'Any moment' : `about ${q.estimatedWaitMinutes} min`}</dd></div>
            )}
            <div><dt>Doctor</dt><dd>{q.doctorName}</dd></div>
            <div><dt>Slot</dt><dd>{fmtDate(q.date)}, {fmtTime(q.slotTime)}</dd></div>
          </dl>
        </div>
      </section>
      <p className="muted">{updated && `Updated ${updated.toLocaleTimeString()}. This page refreshes every 5 seconds.`}</p>
      <Link to="/patient/appointments">Back to my appointments</Link>
    </>
  );
}
