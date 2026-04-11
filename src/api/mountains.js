export async function fetchMountains() {
  const res = await fetch('/api/mountains');
  if (!res.ok) throw new Error('Failed to load mountains');
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Server is starting up — please refresh in a moment.');
  }
  return res.json();
}
