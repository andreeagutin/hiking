const BASE = '/api/tracked-hikes';

function userToken() {
  return localStorage.getItem('user_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken()}`,
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function saveTrack(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchTracks() {
  const res = await fetch(BASE, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchTrack(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function deleteTrack(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export function gpxDownloadUrl(id) {
  return `${BASE}/${id}/gpx`;
}
