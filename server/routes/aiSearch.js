import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

const SYSTEM_PROMPT = `You are a hiking trip assistant. Parse the user's natural language query into structured JSON filters for searching hikes.

Available hike fields:
- time: number (hours, hike duration)
- distance: number (km, trail length)
- up: number (meters, elevation gain)
- difficulty: "easy" | "medium" | null
- tip: "Dus-intors" (round trip) | "Dus" (one way) | null
- status: "Done" | "In progress" | "Not started" | null
- mountains: string (mountain range name, must exactly match one of the provided available values or null)
- zone: string (zone name, must exactly match one of the provided available values or null)
- maxDriveHours: number (maximum driving time from user's location, in hours)

Return ONLY a valid JSON object with these fields (use null for unspecified):
{
  "maxHikeHours": number | null,
  "minHikeHours": number | null,
  "maxDistanceKm": number | null,
  "minDistanceKm": number | null,
  "maxElevationUp": number | null,
  "difficulty": "easy" | "medium" | null,
  "mountains": string | null,
  "zone": string | null,
  "tip": "Dus-intors" | "Dus" | null,
  "status": "Done" | "In progress" | "Not started" | null,
  "maxDriveHours": number | null,
  "explanation": string
}

The "explanation" field should be a short human-readable summary in the same language as the query (Romanian or English) describing what filters were applied.

Examples:
- "vreau o drumetie de 2 ore" → maxHikeHours: 2
- "tur-retur, max 10 km" → tip: "Dus-intors", maxDistanceKm: 10
- "drumetie usoara" → difficulty: "easy"
- "drumul cu masina maxim 1 ora" → maxDriveHours: 1
- "drumetie de cel putin 5 ore in Retezat" → minHikeHours: 5, mountains: (match from available list or null)

Only output the JSON object, no markdown, no explanation outside the JSON.`;

router.post('/', async (req, res) => {
  const { query, availableMountains = [], availableZones = [] } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'query is required' });
  }
  if (query.length > 500) {
    return res.status(400).json({ error: 'query too long' });
  }

  const userMessage = [
    `Query: "${query.trim()}"`,
    availableMountains.length ? `Available mountains: ${availableMountains.join(', ')}` : '',
    availableZones.length ? `Available zones: ${availableZones.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
    console.log(message)

    const raw = message.content[0]?.text ?? '';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let filters;
    try {
      filters = JSON.parse(text);
    } catch {
      return res.status(422).json({ error: 'AI returned invalid JSON', raw });
    }

    const { explanation, ...rest } = filters;
    return res.json({ filters: rest, explanation: explanation ?? '' });
  } catch (err) {
    console.error('[ai-search] error:', err.message);
    return res.status(500).json({ error: 'AI search failed' });
  }
});

export default router;
