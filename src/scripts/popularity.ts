const POPULARITY_KEY = "daily-games:popularity";

export type PopularityCounts = Record<string, number>;

export function readPopularity(): PopularityCounts {
  try {
    const raw = localStorage.getItem(POPULARITY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const counts: PopularityCounts = {};

    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        counts[id] = value;
      }
    }

    return counts;
  } catch {
    return {};
  }
}

// Counts one tap on a game and returns the updated counts so callers can
// re-order right away.
export function incrementPopularity(id: string): PopularityCounts {
  const counts = readPopularity();
  counts[id] = (counts[id] ?? 0) + 1;

  try {
    localStorage.setItem(POPULARITY_KEY, JSON.stringify(counts));
  } catch {
    // Storage unavailable; the count still applies for this page view.
  }

  return counts;
}
