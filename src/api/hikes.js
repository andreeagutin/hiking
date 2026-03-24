const BASE = '/api/hikes';

export async function fetchHikes() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('');
  return res.json();
}

export async function createHike(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create hike');
  return res.json();
}

export async function updateHike(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update hike');
  return res.json();
}

export async function deleteHike(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete hike');
  return res.json();
}
