export async function fetchMountains() {
  const res = await fetch('/api/mountains');
  if (!res.ok) throw new Error('Failed to load mountains');
  return res.json();
}
