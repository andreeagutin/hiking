import { getToken } from './auth.js';

const BASE = '/api/hikes';

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function parseJSON(res) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Server is starting up — please refresh in a moment.');
  }
  return res.json();
}

export async function fetchHikes({ all = false } = {}) {
  const res = await fetch(all ? `${BASE}?all=true` : BASE);
  if (!res.ok) throw new Error('Failed to load hikes');
  return parseJSON(res);
}

export async function fetchHike(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Hike not found');
  return parseJSON(res);
}

export async function createHike(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create hike');
  return res.json();
}

export async function updateHike(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update hike');
  return res.json();
}

export async function deleteHike(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete hike');
  return res.json();
}

export async function addHistory(hikeId, data) {
  const res = await fetch(`${BASE}/${hikeId}/history`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add history entry');
  return res.json();
}

export async function updateHistory(hikeId, entryId, data) {
  const res = await fetch(`${BASE}/${hikeId}/history/${entryId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update history entry');
  return res.json();
}

export async function deleteHistory(hikeId, entryId) {
  const res = await fetch(`${BASE}/${hikeId}/history/${entryId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete history entry');
  return res.json();
}
