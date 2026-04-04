import { getToken } from './auth.js';

const BASE = '/api/poi';

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchPois() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to load points of interest');
  return res.json();
}

export async function fetchPoi(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Point of interest not found');
  return res.json();
}

export async function createPoi(data) {
  const res = await fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create point of interest');
  return res.json();
}

export async function updatePoi(id, data) {
  const res = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update point of interest');
  return res.json();
}

export async function deletePoi(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete point of interest');
  return res.json();
}
