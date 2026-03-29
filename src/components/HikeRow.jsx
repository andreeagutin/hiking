import React from 'react';
const n = (v) => v ?? '';

function Badge({ value, prefix }) {
  if (!value) return null;
  const cls = `${prefix}-${value.replace(/\s+/g, '-')}`;
  return <span className={`badge ${cls}`}>{value}</span>;
}

export function ViewRow({ hike }) {
  return (
    <tr>
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
    </tr>
  );
}
