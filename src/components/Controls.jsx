export default function Controls({ filters, onChange, hikes }) {
  const mountains = [...new Set(hikes.map((h) => h.mountains).filter(Boolean))].sort();
  const zones = [...new Set(hikes.map((h) => h.zone).filter(Boolean))].sort();

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="top-bar">
      <div className="controls">
        <input
          type="search"
          placeholder="Search anything…"
          value={filters.q}
          onChange={set('q')}
        />
        <select value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          <option>Done</option>
          <option>In progress</option>
          <option>Not started</option>
        </select>
        <select value={filters.difficulty} onChange={set('difficulty')}>
          <option value="">All difficulties</option>
          <option>easy</option>
          <option>medium</option>
        </select>
        <select value={filters.mountains} onChange={set('mountains')}>
          <option value="">All mountains</option>
          {mountains.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={filters.zone} onChange={set('zone')}>
          <option value="">All zones</option>
          {zones.map((z) => <option key={z}>{z}</option>)}
        </select>
        <select value={filters.tip} onChange={set('tip')}>
          <option value="">All trip types</option>
          <option>Dus-intors</option>
          <option>Dus</option>
        </select>
      </div>
    </div>
  );
}
