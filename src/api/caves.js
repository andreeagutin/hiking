import { getToken } from './auth.js';

const BASE = '/api/caves';

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchCaves() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to load caves');
  return res.json();
}

export async function fetchCave(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Cave not found');
  return res.json();
}

export async function createCave(data) {
  const res = await fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create cave');
  return res.json();
}

export async function updateCave(id, data) {
  const res = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update cave');
  return res.json();
}

export async function deleteCave(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete cave');
  return res.json();
}
