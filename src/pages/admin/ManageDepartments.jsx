import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';

const EMPTY = { name: '', description: '' };

export default function ManageDepartments() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/departments').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await api.put(`/admin/departments/${editing}`, form);
      else await api.post('/admin/departments', form);
      setForm(EMPTY); setEditing(null); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete the ${d.name} department?`)) return;
    setError('');
    try { await api.delete(`/admin/departments/${d.id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h1>Departments</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <form className="card form inline-form" onSubmit={save}>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Description<input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button className="btn btn-primary">{editing ? 'Save changes' : 'Add department'}</button>
        {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>}
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Description</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td><td>{d.description}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => { setEditing(d.id); setForm({ name: d.name, description: d.description || '' }); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(d)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
