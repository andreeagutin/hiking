export function slugify(str) {
  return str
    .replace(/[ăÃ]/gi, 'a')
    .replace(/[âÂ]/gi, 'a')
    .replace(/[îÎ]/gi, 'i')
    .replace(/[șşŞȘ]/gi, 's')
    .replace(/[țţŢȚ]/gi, 't')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generate a unique slug for a hike name.
 * If the base slug is taken by another document, appends -2, -3, etc.
 * @param {string} name
 * @param {import('mongoose').Model} Model
 * @param {string|null} excludeId  — _id of the document being updated (to skip itself)
 */
export async function uniqueSlug(name, Model, excludeId = null) {
  const base = slugify(name);
  let candidate = base;
  let counter = 1;
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Model.findOne(query).lean();
    if (!existing) return candidate;
    counter++;
    candidate = `${base}-${counter}`;
  }
}
