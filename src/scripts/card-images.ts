const CARD_IMAGES_KEY = "daily-games:card-images";

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
    image.src = image.dataset.src ?? "";
    image.removeAttribute("data-src");
  }
}
