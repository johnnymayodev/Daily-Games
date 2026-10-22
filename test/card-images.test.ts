import { describe, expect, it, vi } from "vitest";
import { applyCardImages, isCardImagesEnabled, storeCardImagesEnabled } from "../src/scripts/card-images";
import { createFakeElement, installFakeDocument } from "./helpers";

const CARD_IMAGES_KEY = "daily-games:card-images";

// The window the script uses to tell cached images from slow ones.
const INSTANT_LOAD_WINDOW_MS = 100;

describe("isCardImagesEnabled", () => {
  it("defaults to enabled when nothing is stored", () => {
    expect(isCardImagesEnabled()).toBe(true);
  });

  it("reflects the stored setting", () => {
    localStorage.setItem(CARD_IMAGES_KEY, "off");
    expect(isCardImagesEnabled()).toBe(false);

    localStorage.setItem(CARD_IMAGES_KEY, "on");
    expect(isCardImagesEnabled()).toBe(true);
  });
});

describe("storeCardImagesEnabled", () => {
  it("stores the enabled state", () => {
    storeCardImagesEnabled(false);
    expect(localStorage.getItem(CARD_IMAGES_KEY)).toBe("off");

    storeCardImagesEnabled(true);
    expect(localStorage.getItem(CARD_IMAGES_KEY)).toBe("on");
  });
});

describe("applyCardImages", () => {
  it("marks the page as disabled and leaves the images alone", () => {
    const image = createFakeElement({ dataset: { src: "/game.png" } });
    const document = installFakeDocument({ images: [image] });

    applyCardImages(false);

    expect(document.documentElement.dataset.cardImages).toBe("off");
    expect(image.src).toBe("");
    expect(image.classList.contains("game-card-image-loading")).toBe(false);
  });

  it("does not mark an already cached image as loading once the instant window closes", () => {
    vi.useFakeTimers();

    const cached = createFakeElement({ dataset: { src: "/cached.png" }, complete: true });
    const slow = createFakeElement({ dataset: { src: "/slow.png" }, complete: false });

    installFakeDocument({ images: [cached, slow] });

    applyCardImages(true);
    vi.advanceTimersByTime(INSTANT_LOAD_WINDOW_MS);

    expect(cached.classList.contains("game-card-image-loading")).toBe(false);
    expect(slow.classList.contains("game-card-image-loading")).toBe(true);
  });

  it("stops marking an image as loading once it loads", () => {
    vi.useFakeTimers();

    const slow = createFakeElement({ dataset: { src: "/slow.png" }, complete: false });

    installFakeDocument({ images: [slow] });

    applyCardImages(true);
    vi.advanceTimersByTime(INSTANT_LOAD_WINDOW_MS);

    expect(slow.classList.contains("game-card-image-loading")).toBe(true);

    slow.dispatchEvent("load");

    expect(slow.classList.contains("game-card-image-loading")).toBe(false);
  });
});
