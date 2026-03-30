import { getToken } from './auth.js';

const BASE = '/api/restaurants';

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchRestaurants() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to load restaurants');
  return res.json();
}

export async function fetchRestaurant(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Restaurant not found');
  return res.json();
}

export async function createRestaurant(data) {
  const res = await fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create restaurant');
  return res.json();
}

export async function updateRestaurant(id, data) {
  const res = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update restaurant');
  return res.json();
}

export async function deleteRestaurant(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete restaurant');
  return res.json();
}
