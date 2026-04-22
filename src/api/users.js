const BASE = '/api/users';

function authHeaders() {
  const token = localStorage.getItem('user_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getUserToken() {
  return localStorage.getItem('user_token');
}

export function isUserLoggedIn() {
  const token = localStorage.getItem('user_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function getUserFromToken() {
  const token = localStorage.getItem('user_token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export async function registerUser({ email, password, name }) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('user_token', data.token);
  window.dispatchEvent(new Event('userchange'));
  return data;
}

export function logoutUser() {
  localStorage.removeItem('user_token');
  window.dispatchEvent(new Event('userchange'));
}

export async function getProfile() {
  const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function updateProfile(updates) {
  const res = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

export async function getSaved() {
  const res = await fetch(`${BASE}/me/saved`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load saved items');
  return data; // { hikes: [...], restaurants: [...], pois: [...] }
}

export async function saveItem(type, id) {
  const res = await fetch(`${BASE}/me/saved/${type}/${id}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save item');
  return data;
}

export async function unsaveItem(type, id) {
  const res = await fetch(`${BASE}/me/saved/${type}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unsave item');
  return data;
}
