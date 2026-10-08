import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { addDaysISO, fmtTime, todayISO } from '../../utils/format';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get(`/doctors/${doctorId}`).then((r) => setDoctor(r.data)).catch((e) => setError(errMsg(e))); }, [doctorId]);

  useEffect(() => {
    setSlot(null);
    api.get(`/doctors/${doctorId}/slots`, { params: { date } })
      .then((r) => setSlots(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [doctorId, date]);

  const book = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/appointments', { doctorId: Number(doctorId), date, slotTime: slot.time, reason });
      navigate(`/patient/queue/${data.id}`);
    } catch (err) {
      setError(errMsg(err));
      api.get(`/doctors/${doctorId}/slots`, { params: { date } }).then((r) => setSlots(r.data));
      setSlot(null);
    }
    setBusy(false);
  };

  const open = slots.filter((s) => s.available).length;

  return (
    <>
      <h1>Book with {doctor ? doctor.name : '…'}</h1>
      {doctor && <p className="muted">{doctor.departmentName} · {doctor.specialization}</p>}
      <form className="card form wide" onSubmit={book}>
        {error && <p className="alert" role="alert">{error}</p>}
        <label>Date
          <input type="date" min={todayISO()} max={addDaysISO(30)} value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <fieldset>
          <legend>Pick a time ({open} open)</legend>
          {slots.length === 0 && <p className="empty">This doctor has no slots on this day.</p>}
          <div className="slots">
            {slots.map((s) => (
              <button type="button" key={s.time} disabled={!s.available}
                className={`slot ${slot?.time === s.time ? 'selected' : ''}`}
                aria-pressed={slot?.time === s.time}
                onClick={() => setSlot(s)}>
                {fmtTime(s.time)}
              </button>
            ))}
          </div>
        </fieldset>

        <label>Reason for visit (optional)
          <textarea rows="3" maxLength="500" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>

        <button className="btn btn-primary" disabled={!slot || busy}>
          {busy ? 'Booking…' : slot ? `Book ${fmtTime(slot.time)} and get token ${slot.token}` : 'Pick a time to continue'}
        </button>
      </form>
    </>
  );
}
