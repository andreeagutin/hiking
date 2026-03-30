import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchHikes } from '../api/hikes.js';

const PURPLE   = '#7c3aed';
const INDIGO   = '#4f46e5';
const GREEN    = '#16a34a';
const AMBER    = '#d97706';
const GRAY     = '#9ca3af';
const TEAL     = '#0d9488';
const ROSE     = '#e11d48';

const STATUS_COLORS = { Done: GREEN, 'In progress': AMBER, 'Not started': GRAY };
const DIFF_COLORS   = { easy: GREEN, medium: AMBER, unknown: GRAY };
const BAR_COLORS    = [PURPLE, INDIGO, TEAL, ROSE, AMBER, GREEN];

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ label, value, sub, color = PURPLE }) {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-card-value" style={{ color }}>{value}</div>
      <div className="stats-card-label">{label}</div>
      {sub && <div className="stats-card-sub">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-title">{title}</div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span>{p.name || p.dataKey}: <strong>{p.value}{unit}</strong></span>
        </div>
      ))}
    </div>
  );
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StatsPage() {
  const [hikes, setHikes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHikes().then(setHikes).catch((e) => setError(e.message));
  }, []);

  if (error) return (
    <div className="detail-error-wrap">
      <div className="error-banner">⚠ {error}</div>
      <button className="detail-back-btn" onClick={() => window.location.href = '/'}>← Back</button>
    </div>
  );

  const done = hikes.filter((h) => h.status === 'Done');

  // Summary stats
  const totalKm       = done.reduce((s, h) => s + (h.distance || 0), 0);
  const totalUp       = done.reduce((s, h) => s + (h.up || 0), 0);
  const totalHours    = done.reduce((s, h) => s + (h.time || 0), 0);
  const totalDown     = done.reduce((s, h) => s + (h.down || 0), 0);

  // Status pie
  const statusCounts = ['Done', 'In progress', 'Not started'].map((s) => ({
    name: s,
    value: hikes.filter((h) => h.status === s).length,
  })).filter((d) => d.value > 0);

  // Difficulty pie
  const diffCounts = ['easy', 'medium'].map((d) => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: hikes.filter((h) => h.difficulty === d).length,
    key: d,
  }));
  const unknownDiff = hikes.filter((h) => !h.difficulty).length;
  if (unknownDiff > 0) diffCounts.push({ name: 'Unknown', value: unknownDiff, key: 'unknown' });

  // Km by mountain range (done hikes only)
  const byMountain = {};
  done.forEach((h) => {
    if (!h.mountains) return;
    byMountain[h.mountains] = (byMountain[h.mountains] || 0) + (h.distance || 0);
  });
  const mountainData = Object.entries(byMountain)
    .map(([name, km]) => ({ name, km: parseFloat(km.toFixed(1)) }))
    .sort((a, b) => b.km - a.km);

  // Hikes completed per month (last 24 months with data)
  const monthCounts = {};
  done.forEach((h) => {
    if (!h.completed) return;
    const d = new Date(h.completed + 'T00:00:00');
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  const monthData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [y, m] = key.split('-');
      return { name: `${MONTHS_SHORT[parseInt(m) - 1]} ${y}`, count };
    });

  // Elevation per mountain range
  const elevByMountain = {};
  done.forEach((h) => {
    if (!h.mountains) return;
    elevByMountain[h.mountains] = (elevByMountain[h.mountains] || 0) + (h.up || 0);
  });
  const elevData = Object.entries(elevByMountain)
    .map(([name, up]) => ({ name, up }))
    .sort((a, b) => b.up - a.up);

  const loading = hikes.length === 0;

  return (
    <div className="stats-page">
      {/* Header */}
      <div className="stats-header">
        <div className="stats-header-inner">
          <button className="detail-back-btn" onClick={() => window.location.href = '/'}>← All trails</button>
          <div>
            <h1 className="stats-title">My hiking stats</h1>
            <p className="stats-subtitle">{done.length} completed hike{done.length !== 1 ? 's' : ''} · {hikes.length} total trails</p>
          </div>
        </div>
        <div className="hero-silhouette">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 L0,50 L120,25 L240,45 L360,12 L480,35 L600,6 L720,30 L840,10 L960,32 L1080,16 L1200,40 L1320,20 L1440,35 L1440,80 Z" fill="var(--bg)"/>
          </svg>
        </div>
      </div>

      <div className="stats-content">
        {loading ? (
          <div className="detail-loading">Loading stats…</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="stats-cards-grid">
              <StatCard label="Trails completed" value={done.length} sub={`of ${hikes.length} total`} color={PURPLE} />
              <StatCard label="Distance hiked" value={`${totalKm.toFixed(0)} km`} color={INDIGO} />
              <StatCard label="Elevation gained" value={`${totalUp.toLocaleString()} m`} color={TEAL} />
              <StatCard label="Elevation lost" value={`${totalDown.toLocaleString()} m`} color={ROSE} />
              <StatCard label="Total time" value={`${totalHours.toFixed(0)} h`} sub={`≈ ${(totalHours / 8).toFixed(0)} days`} color={AMBER} />
              <StatCard label="Avg distance" value={done.length ? `${(totalKm / done.length).toFixed(1)} km` : '—'} sub="per completed hike" color={GREEN} />
            </div>

            {/* Charts */}
            <div className="charts-grid">

              {/* Status breakdown */}
              <ChartCard title="Trail status">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100} labelLine={false} label={<CustomPieLabel />}>
                      {statusCounts.map((d) => (
                        <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Difficulty breakdown */}
              <ChartCard title="Difficulty breakdown">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={diffCounts} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100} labelLine={false} label={<CustomPieLabel />}>
                      {diffCounts.map((d) => (
                        <Cell key={d.key} fill={DIFF_COLORS[d.key] || GRAY} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Km by mountain range */}
              {mountainData.length > 0 && (
                <ChartCard title="Distance by mountain range (km)">
                  <ResponsiveContainer width="100%" height={Math.max(220, mountainData.length * 52)}>
                    <BarChart data={mountainData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e9e8" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7675' }} tickLine={false} axisLine={false} unit=" km" />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13, fill: '#374140' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip unit=" km" />} cursor={{ fill: '#f5f3ff' }} />
                      <Bar dataKey="km" radius={[0, 6, 6, 0]} maxBarSize={32}>
                        {mountainData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Elevation by mountain range */}
              {elevData.length > 0 && (
                <ChartCard title="Elevation gained by mountain range (m)">
                  <ResponsiveContainer width="100%" height={Math.max(220, elevData.length * 52)}>
                    <BarChart data={elevData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e9e8" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7675' }} tickLine={false} axisLine={false} unit=" m" />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13, fill: '#374140' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip unit=" m" />} cursor={{ fill: '#f5f3ff' }} />
                      <Bar dataKey="up" radius={[0, 6, 6, 0]} maxBarSize={32}>
                        {elevData.map((_, i) => <Cell key={i} fill={BAR_COLORS[(i + 2) % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Hikes per month */}
              {monthData.length > 0 && (
                <ChartCard title="Hikes completed by month">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e9e8" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7675' }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7675' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
                      <Bar dataKey="count" name="Hikes" fill={PURPLE} radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
