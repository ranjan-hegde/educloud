// idGenerator.js
// Shared helper for generating new record IDs across every CRUD "Create"
// handler in the app.
//
// BUG THIS FIXES: every create handler previously generated new IDs from
// `list.length + 1` (e.g. `STU${2300 + prev.length + 1}`). That scheme
// silently produces DUPLICATE IDs as soon as any record has ever been
// deleted, because the array shrinks and a later "next" id collides with
// an id that still exists. Example: 8 students (STU2301..STU2308), delete
// STU2308, add a new student -> length is now 7, so the new id becomes
// STU2308 again -> two different students end up sharing the same ID.
//
// Fix: derive the next id from the HIGHEST numeric suffix currently in use
// (scanning the real, current list — including any items outside the
// visible/filtered view), never from the list's length.
export function nextId(items, prefix, { pad = 0, start = 0 } = {}) {
  let max = start;
  for (const item of items || []) {
    if (item && typeof item.id === "string" && item.id.startsWith(prefix)) {
      const suffix = item.id.slice(prefix.length);
      if (/^\d+$/.test(suffix)) {
        const n = parseInt(suffix, 10);
        if (n > max) max = n;
      }
    }
  }
  const next = max + 1;
  return `${prefix}${pad ? String(next).padStart(pad, "0") : next}`;
}
