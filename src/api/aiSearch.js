export async function askAI(query, availableMountains = [], availableZones = []) {
  const res = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, availableMountains, availableZones }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI search failed');
  }
  return res.json(); // { filters, explanation }
}
