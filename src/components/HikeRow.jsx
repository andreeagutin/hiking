import { useState } from 'react';

const n = (v) => v ?? '';

function Badge({ value, prefix }) {
  if (!value) return null;
  const cls = `${prefix}-${value.replace(/\s+/g, '-')}`;
  return <span className={`badge ${cls}`}>{value}</span>;
}

export function ViewRow({ hike, onEdit }) {
  return (
    <tr onClick={() => onEdit(hike)}>
      <td>{n(hike.name)}</td>
      <td>{n(hike.time)}</td>
      <td>{n(hike.distance)}</td>
      <td>{n(hike.tip)}</td>
      <td>{n(hike.up)}</td>
      <td>{n(hike.down)}</td>
      <td><Badge value={hike.difficulty} prefix="diff" /></td>
      <td>{n(hike.mountains)}</td>
      <td><Badge value={hike.status} prefix="status" /></td>
      <td>{n(hike.completed)}</td>
      <td>{n(hike.zone)}</td>
      <td className="actions">
        <button className="btn-edit" onClick={(e) => { e.stopPropagation(); onEdit(hike); }}>Edit</button>
      </td>
    </tr>
  );
}

export function EditRow({ hike, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...hike });

  const set = (key) => (e) => {
    const numFields = ['time', 'distance', 'up', 'down'];
    const raw = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: numFields.includes(key) ? (raw === '' ? null : parseFloat(raw)) : (raw === '' ? null : raw),
    }));
  };

  const sel = (key, opts) => (
    <select className="edit-input" value={form[key] ?? ''} onChange={set(key)}>
      <option value=""></option>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <tr className="editing">
      <td><input className="edit-input" type="text"   value={n(form.name)}       onChange={set('name')} /></td>
      <td><input className="edit-input" type="number" value={n(form.time)}       onChange={set('time')}       step="0.01" /></td>
      <td><input className="edit-input" type="number" value={n(form.distance)}   onChange={set('distance')}   step="0.01" /></td>
      <td>{sel('tip',        ['Dus-intors', 'Dus'])}</td>
      <td><input className="edit-input" type="number" value={n(form.up)}         onChange={set('up')} /></td>
      <td><input className="edit-input" type="number" value={n(form.down)}       onChange={set('down')} /></td>
      <td>{sel('difficulty', ['easy', 'medium'])}</td>
      <td><input className="edit-input" type="text"   value={n(form.mountains)}  onChange={set('mountains')} /></td>
      <td>{sel('status',     ['Done', 'In progress', 'Not started'])}</td>
      <td><input className="edit-input" type="text"   value={n(form.completed)}  onChange={set('completed')} placeholder="dd/mm/yyyy" /></td>
      <td><input className="edit-input" type="text"   value={n(form.zone)}       onChange={set('zone')} /></td>
      <td className="actions">
        <button className="btn-ok"     onClick={() => onSave(form)}>Save</button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-delete" onClick={() => onDelete(hike._id)}>✕</button>
      </td>
    </tr>
  );
}
