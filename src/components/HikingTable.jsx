import React from 'react';
import { useState } from 'react';
import { ViewRow } from './HikeRow.jsx';

const COLS = [
  { key: 'name',       label: 'Name' },
  { key: 'time',       label: 'Time (h)' },
  { key: 'distance',   label: 'Distance (km)' },
  { key: 'tip',        label: 'Type' },
  { key: 'up',         label: 'Up (m)' },
  { key: 'down',       label: 'Down (m)' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'mountains',  label: 'Mountains' },
  { key: 'status',     label: 'Status' },
  { key: 'completed',  label: 'Completed' },
  { key: 'zone',       label: 'Zone' },
];

function parseDate(s) {
  if (!s) return 0;
  const [d, m, y] = s.split('/');
  return new Date(y, m - 1, d).getTime();
}

export default function HikingTable({ hikes }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  function handleSort(key) {
    if (sortCol === key) setSortDir((d) => d * -1);
    else { setSortCol(key); setSortDir(1); }
  }

  const sorted = [...hikes].sort((a, b) => {
    if (!sortCol) return 0;
    let av = a[sortCol] ?? '';
    let bv = b[sortCol] ?? '';
    if (sortCol === 'completed') { av = parseDate(av); bv = parseDate(bv); }
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLS.map(({ key, label }) => {
              const cls = sortCol === key ? (sortDir === 1 ? 'asc' : 'desc') : '';
              return (
                <th key={key} className={cls} onClick={() => handleSort(key)}>
                  {label} <span className="sort-icon"></span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={11} className="no-results">No hikes match your filters.</td></tr>
          ) : (
            sorted.map((hike) => <ViewRow key={hike._id} hike={hike} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
