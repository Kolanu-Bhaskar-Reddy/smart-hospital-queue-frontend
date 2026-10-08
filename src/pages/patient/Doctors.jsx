import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { fmtTime } from '../../utils/format';

export default function Doctors() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/departments').then((r) => setDepartments(r.data)).catch((e) => setError(errMsg(e))); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get('/doctors', { params: { q: q || undefined, departmentId: departmentId || undefined } })
        .then((r) => setDoctors(r.data))
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, departmentId]);

  return (
    <>
      <h1>Find a doctor</h1>
      <div className="toolbar">
        <input type="search" placeholder="Search by name, specialty or department" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search doctors" />
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} aria-label="Department">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      {!loading && doctors.length === 0 && <p className="empty">No doctors match your search. Try a different name or department.</p>}
      <div className="grid">
        {doctors.map((d) => (
          <article key={d.id} className="card doctor">
            <h3>{d.name}</h3>
            <p className="muted">{d.specialization || d.departmentName} · {d.departmentName}</p>
            <p>Sees patients {fmtTime(d.startTime)} to {fmtTime(d.endTime)}, {d.consultationMinutes} min each</p>
            <Link className="btn btn-primary" to={`/patient/book/${d.id}`}>Book appointment</Link>
          </article>
        ))}
      </div>
    </>
  );
}
