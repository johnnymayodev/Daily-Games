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

// Counts one tap on a game so the grid can rank it higher.
export function incrementPopularity(id: string): void {
  const counts = readPopularity();
  counts[id] = (counts[id] ?? 0) + 1;
  storePopularity(counts);
}

// Clears one game's tap count so it falls back to the default ranking.
export function resetPopularity(id: string): void {
  const counts = readPopularity();
  delete counts[id];
  storePopularity(counts);
}

// Re-orders the home-screen grid in place using the current counts. Games with
// equal counts keep their default rank, so a reset restores the default order.
export function sortGameGridByPopularity(): void {
  const grid = document.querySelector<HTMLElement>(".game-grid");

  if (!grid) {
    return;
  }

  const counts = readPopularity();
  const countOf = (card: HTMLElement) => counts[card.dataset.gameId ?? ""] ?? 0;
  const rankOf = (card: HTMLElement) => Number(card.dataset.defaultRank ?? 0);
  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".game-card"));

  cards.sort((a, b) => countOf(b) - countOf(a) || rankOf(a) - rankOf(b));
  grid.append(...cards);
}

function storePopularity(counts: PopularityCounts): void {
  try {
    localStorage.setItem(POPULARITY_KEY, JSON.stringify(counts));
  } catch {
    // Storage unavailable; the change still applies for this page view.
  }
}
