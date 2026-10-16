const CARD_IMAGES_KEY = "daily-games:card-images";

// Images the browser can fulfill within this window are cache hits; they
// appear instantly instead of fading in like images that take real time to load.
const INSTANT_LOAD_WINDOW_MS = 100;

export function isCardImagesEnabled(): boolean {
  try {
    return localStorage.getItem(CARD_IMAGES_KEY) !== "off";
  } catch {
    return true;
  }
}

export function storeCardImagesEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(CARD_IMAGES_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable; the setting still applies for this page view.
  }
}

export function applyCardImages(enabled: boolean): void {
  document.documentElement.dataset.cardImages = enabled ? "on" : "off";

  if (!enabled) {
    return;
  }

  for (const image of document.querySelectorAll<HTMLImageElement>("img.game-card-image[data-src]")) {
    const fadeTimer = setTimeout(() => {
      if (!image.complete) {
        image.classList.add("game-card-image-loading");
      }
    }, INSTANT_LOAD_WINDOW_MS);

    image.addEventListener(
      "load",
      () => {
        clearTimeout(fadeTimer);
        image.classList.remove("game-card-image-loading");
      },
      { once: true },
    );

    // Attach the listener before setting src so fast cached loads cannot race it.
    image.src = image.dataset.src ?? "";
    image.removeAttribute("data-src");
  }
}
